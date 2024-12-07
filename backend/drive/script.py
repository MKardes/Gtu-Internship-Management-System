import datetime
import os
import pickle
import psycopg2
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build
from google.auth.transport.requests import Request
import io
from googleapiclient.http import MediaIoBaseDownload
import pdfplumber
from dotenv import load_dotenv


load_dotenv(dotenv_path="../.env")

# Google API OAuth2 izinleri
SCOPES = ['https://www.googleapis.com/auth/drive.readonly']

# PostgreSQL veritabanı bağlantı ayarları
DB_CONFIG = {
    'dbname': os.getenv("POSTGRESQL_DB"),
    'user': os.getenv("POSTGRESQL_USER"),
    'password': os.getenv("POSTGRESQL_PWD"),
    'host': os.getenv("POSTGRESQL_HOST"),
    'port': os.getenv("POSTGRESQL_PORT")
}

def authenticate_google_drive():
    creds = None
    # Token dosyası var mı kontrol et
    if os.path.exists('token.pickle'):
        with open('token.pickle', 'rb') as token:
            creds = pickle.load(token)
    
    # Kimlik doğrulaması gerekliyse veya token geçerli değilse
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())  # Geçerli token varsa, yenileme işlemi
        else:
            # Yeni bir kimlik doğrulama yapılır (sadece gerekliyse)
            flow = InstalledAppFlow.from_client_secrets_file('cred.json', SCOPES)
            creds = flow.run_local_server(port=65402)  # Tarayıcı üzerinden kimlik doğrulaması yapılır
        # Token'ı kaydet
        with open('token.pickle', 'wb') as token:
            pickle.dump(creds, token)
    
    # API istemcisini oluştur
    service = build('drive', 'v3', credentials=creds)
    return service


def list_pdf_files(service, keyword):
    query = f"mimeType='application/pdf' and name contains '{keyword}'"
    results = service.files().list(q=query, fields="files(id, name)").execute()
    return results.get('files', [])


# PostgreSQL bağlantısı kurma
def create_db_connection():
    try:
        conn = psycopg2.connect(**DB_CONFIG)
        return conn
    except Exception as e:
        print(f"Veritabanı bağlantısı hatası: {e}")
        return None

# Sınıflar
class Ogrenci:
    def __init__(self, tc_kimlik_no, adi, soyadi, ogrenci_no, email):
        self.tc_kimlik_no = tc_kimlik_no
        self.adi = adi
        self.soyadi = soyadi
        self.ogrenci_no = ogrenci_no
        self.email = email

class Mentor:
    def __init__(self, adi, soyadi, numara, eposta):
        self.adi = adi
        self.soyadi = soyadi
        self.eposta = eposta
        self.numara = numara

class Company:
    def __init__(self, adi, adres):
        self.adi = adi
        self.adres = adres

class Staj:
    def __init__(self, begin_date, end_date, type, ogrenci, kurum, mentor):
        self.begin_date = begin_date
        self.end_date = end_date
        self.type = type
        self.ogrenci = ogrenci
        self.kurum = kurum
        self.mentor = mentor

# PDF dosyasını indirip oku
def read_and_parse_pdf(service, file_id):
    try:
        request = service.files().get_media(fileId=file_id)
        file_data = io.BytesIO()
        downloader = MediaIoBaseDownload(file_data, request)
        done = False
        while not done:
            _, done = downloader.next_chunk()
        file_data.seek(0)  # Bellek dosyasını başa sar
        return parse_pdf(file_data)
    except Exception as e:
        print(f"PDF okunurken hata oluştu: {e}")
        return None

# PDF'i analiz eden fonksiyon
def parse_pdf(file_data):
    text = "\n".join(page.extract_text() for page in pdfplumber.open(file_data).pages)
    type = text.split("Zorunlu")[1].split("stajımı")[0].strip()
    tarihler_arasi = text.split("stajımı")[1].split("tarihleri")[0].strip()
    begin_date = tarihler_arasi.split("-")[0].strip()
    end_date = tarihler_arasi.split("-")[1].strip()

    ogrenci = Ogrenci(
        tc_kimlik_no=text.split("TC Kimlik No")[1].split()[0],
        adi=text.split("Adı Soyadı")[1].split("\n")[0].strip().split()[0],
        soyadi=text.split("Adı Soyadı")[1].split("\n")[0].strip().split()[1],
        email=text.split("Eposta Adresi")[1].split("\n")[0].strip(),
        ogrenci_no=text.split("Öğrenci No")[1].split()[0],
    )
    kurum = Company(
        adi=text.split("Staj Yapılmak İstenilen Kurum/Kuruluş Adı")[1].split("\n")[0].strip(),
        adres=text.split("Kurum/Kuruluşun Adresi")[1].split("\nÖğrenci")[0].strip()
    )
    mentor = Mentor(
        adi=text.split("Temas Kuracağı Kişinin Adı Soyadı")[1].split("\n")[0].strip().split()[0],
        soyadi=text.split("Temas Kuracağı Kişinin Adı Soyadı")[1].split("\n")[0].strip().split()[1],
        numara=text.split("Kurum/Kuruluşun Telefon /Faks Numarası")[1].split("\n")[0].strip().split("/")[0],
        eposta=text.split("Kurum/Kuruluşun Eposta Adresi")[1].split("\n")[0].strip(),
    )
    return Staj(begin_date, end_date, type, ogrenci, kurum, mentor)

# Veritabanına ekleme fonksiyonu
def insert_staj_to_db(staj, conn, pdf_file):
    try:
        cursor = conn.cursor()
        file_id = None
        ogrenci_id = None
        mentor_id = None
        kurum_id = None

        cursor.execute("SELECT id FROM file WHERE name = %s;", (pdf_file['name'],))
        result = cursor.fetchone()
        if result:
            file_id = result[0]
            cursor.close()
            print("{} adlı dosya zaten veritabanında var.".format(pdf_file['name']))
            return
        else:
            cursor.execute(""" INSERT INTO file (name, drive_link)
                        VALUES (%s, %s) RETURNING id;
            """, (pdf_file['name'], "https://drive.google.com/file/d/" + pdf_file['id']))
            file_id = cursor.fetchone()[0]

        cursor.execute("SELECT id FROM student WHERE turkish_id = %s;", (staj.ogrenci.tc_kimlik_no,))
        result = cursor.fetchone()
        if result:
            ogrenci_id = result[0]
        else:
            cursor.execute("""
                INSERT INTO student (turkish_id, name, surname, school_id, email) 
                VALUES (%s, %s, %s, %s, %s) RETURNING id;
            """, (staj.ogrenci.tc_kimlik_no, staj.ogrenci.adi, staj.ogrenci.soyadi, staj.ogrenci.ogrenci_no, staj.ogrenci.email))
            ogrenci_id = cursor.fetchone()[0]

        cursor.execute("SELECT id FROM mentor WHERE name = %s AND surname = %s;", (staj.mentor.adi, staj.mentor.soyadi))
        result = cursor.fetchone()
        if result:
            mentor_id = result[0]
        else:
            cursor.execute("""
                INSERT INTO mentor (name, surname, phone_number, mail)
                VALUES (%s, %s, %s, %s) RETURNING id;
            """, (staj.mentor.adi, staj.mentor.soyadi, staj.mentor.numara, staj.mentor.eposta))
            mentor_id = cursor.fetchone()[0]

        cursor.execute("SELECT id FROM company WHERE name = %s;", (staj.kurum.adi,))
        result = cursor.fetchone()
        if result:
            kurum_id = result[0]
        else:
            cursor.execute("""
                INSERT INTO company (name, address)
                VALUES (%s, %s) RETURNING id;
            """, (staj.kurum.adi, staj.kurum.adres))
            kurum_id = cursor.fetchone()[0]

        cursor.execute("""
            INSERT INTO internship (begin_date, end_date, type, student_id, company_id, mentor_id, file_id)
            VALUES (%s, %s, %s, %s, %s, %s, %s);
        """, (datetime.datetime.strptime(staj.begin_date, "%d.%m.%Y").date(), datetime.datetime.strptime(staj.end_date, "%d.%m.%Y").date(), staj.type[4], ogrenci_id, kurum_id, mentor_id, file_id))

        conn.commit()  # Değişiklikleri kaydet
        cursor.close()
        print("Staj verisi başarıyla eklendi.")
    except Exception as e:
        print("Veritabanına eklerken hata oluştu: {}".format(e))

# Ana fonksiyon
def main():
    service = authenticate_google_drive()
    keyword = "StajFisi"
    pdf_files = list_pdf_files(service, keyword)

    if not pdf_files:
        print("StajFisi içeren PDF dosyası bulunamadı.")
        return

    # PostgreSQL veritabanı bağlantısı oluştur
    conn = create_db_connection()
    if not conn:
        return

    for pdf_file in pdf_files:
        print(f"İşleniyor: {pdf_file['name']} {pdf_file['id']}")
        staj = read_and_parse_pdf(service, pdf_file['id'])
        if staj:
            insert_staj_to_db(staj, conn, pdf_file)

    conn.close()  # Bağlantıyı kapat

if __name__ == '__main__':
    main()

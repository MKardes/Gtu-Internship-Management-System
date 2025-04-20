<h2>Installation Guide</h2>

Install a Postgresql DB
(For my example I runned a docker image)
```bash
docker run --name docker_postgres -e POSTGRES_USER=postgres_user -e POSTGRES_DB=postgres_db -e POSTGRES_PASSWORD=postgres_pass -d -p 5432:5432 postgres
```

Install the repository
```bash
git clone https://github.com/MKardes/Gtu-Internship-Management-System.git
```

--- 
<h3> Backend </h3>

<h4>Set Up Environments</h4>
<h5>Create '.env' file to path: ./backend/. After creation file will be here "./backend/.env" </h5>

<p>Port that backend will be run on.</p>

```bash
  API_PORT=9000
```

<p>Database Environments</p>

``` bash
  POSTGRESQL_HOST='localhost'
  POSTGRESQL_PORT=5432
  POSTGRESQL_DB='postgres_db'
  POSTGRESQL_USER='postgres_user'
  POSTGRESQL_PWD='postgres_pass'
  MIGRATE_DB='true'
```

<p>Create an app <a href='https://myaccount.google.com/apppasswords'>on gmail<a> and put it here.</p>
  
```bash
  EMAIL_USER='mail@mail.com'
  EMAIL_PASS='abcd abcd abcd abcd'
```

<p>Access refresh tokens' secrets.</p>

```bash
  ACCESS_TOKEN_SECRET='access_token_here'
  REFRESH_TOKEN_SECRET='refresh_token_here'
```

<p>Salt for encryption.</p>

```bash
  SALT_ROUNDS=10
```

<p>Drive folder ID. You need to create a drive folder and copy the ID. This folder will be used to synchronize system with student datas by uploading internship documents.</p>

``` bash
  DRIVE_FOLDER_ID='folder_id_here'
```

<h4>Mail Entegration</h4>

<h5>Create API Key</h5>

To make student datas that are in your drive folder synchronized with the system, you need to create an API key. To create it you need to go to the Google Console. You will create a service account. And than create API key for that service account. After creation copy the 'apikey.json' to ```./backend/src/drive/```

<h4>Install Node Modules:</h4>

```bash
#in ./backend directory 
npm install
```

---
<h3> Frontend </h3>

<h4>Set Up Environments</h4>
<h5>Create '.env' file to path: ./front/. After creation file will be here "./front/.env" </h5>

<p>Backend URL needs to be present.</p>

```bash
  REACT_APP_API_URL='http://localhost:9000'
```

<h4>Install Node Modules:</h4>

```bash
#in ./front directory 
npm install
```

---
<h3>Run</h3>

<h4>Create First User</h4>
<p>As there is no user in the database we need to create first user with some sql:</p>

``` bash 
INSERT INTO "user" (mail, full_name, password, role)
VALUES (
	'somemail@mail.com', -- Your super admin mail here
	'admin',
	'',
	'SuperAdmin'
);
```
<p>To run this code you need to reach to the database. There are several ways to do so. You may search about the 'psql' command on linux. (postgresql-client) </p>
<p>After this point super user will be able to create department and department admins. Department admins will be able to create other users. (First finger snap.)</p>
<p>When you first created the user, user will not have his password. You will use the reset password button (Parolamı Unuttum) on login page. </p>
<p>Once you logged in, you can enjoy the website.</p>

<h4>Run Backend</h4>

```bash
#in ./backend directory 
npm run start
```

<h4>Run Frontend</h4>

```bash
#in ./front directory 
npm run start
```

<h3>Author ✍️</h3>
<h2>MKardes</h2>

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Chart from './Chart';
import ChartFilter from './ChartFilter';
import { VscGraph } from "react-icons/vsc";
import axios from 'axios';
import { Button, Card, Modal } from 'react-bootstrap';
import { IoMdAddCircleOutline } from "react-icons/io";
import { BsFillCalendar2DateFill } from "react-icons/bs";

const passedColor = "#28b463";
const failedColor = "#e74c3c";

const GraphXConversions = {
  "midterm_fall": "Dönem İçi 'Güz'",
  "midterm_break": "Ara Dönem",
  "midterm_spring": "Dönem İçi 'Bahar'",
  "summer": "Yaz Dönemi",
}

type Option = {
  value: number;
  name: string;
  id?: string;
}

const getOptions = (data: any) => {
  if (!data) return undefined;

  return ({
    tooltip: {
      trigger: "item",
      formatter: function(params: any) {
        const keyIndex = Object.values(GraphXConversions).indexOf(params.name);
        const keys = Object.keys(GraphXConversions);
        const relatedData = data[keys[keyIndex] as keyof typeof data];

        let tooltip = `
        <div style="font-family: Helvetica, sans-serif; font-size: 12px; font-weight: normal; color: #1e293b;">
          <div>
            <span style="font-size: 14px; font-weight: 600;">${params.name}</span>
          </div>
          <div>
            <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${failedColor};"></span>
            <span>Başarısız: </span>
            <span style="font-size: 13px; font-weight: 600;">${relatedData.failed}</span>
          </div>
          <div>
            <span style="display:inline-block;margin-right:4px;border-radius:10px;width:10px;height:10px;background-color:${passedColor};"></span>
            <span>Başarılı: </span>
            <span style="font-size: 13px; font-weight: 600;">${relatedData.passed}</span>
          </div>
        </div>`.trim();
        return(tooltip);
      }
    },
    grid: {
      top: "10%",
      left: "6%",
      right: "6%",
      bottom: "10%",
    },
    xAxis: {
      type: "category",
      name: "Dönem",
      nameTextStyle: {
        color: '#1e293b',
        fontWeight: 'bold',
        fontSize: 13
      },
      axisLabel: {
        color: '#1e293b',
        fontWeight: 500,
        fontSize: 13
      },
      data: Object.keys(data).map((e: any) => GraphXConversions[e as keyof typeof GraphXConversions]),
    },
    yAxis: {
      type: "value",
      name: "Adet",
      nameTextStyle: {
        color: '#1e293b',
        fontWeight: 'bold',
        fontSize: 13
      },
      axisLabel: {
        color: '#1e293b',
        fontWeight: 500,
        fontSize: 13
      },
    },
    series: [
      {
        name: "passed",
        color: passedColor,
        emphasis: {
          focus: 'series'
        },
        data: Object.values(data).map((e: any) => e.passed),
        type: "bar",
        stack: 'x',
        // barWidth: '50%',
      },
      {
        name: "failed",
        color: failedColor,
        emphasis: {
          focus: 'series'
        },
        data: Object.values(data).map((e: any) => e.failed),
        type: "bar",
        stack: 'x',
      },
    ],
  });
}

const Dashboard: React.FC = () => {
  const [firstData, setFirstData] = useState<any>(); 
  const [secondData, setSecondData] = useState<any>(); 
  const [companies, setCompanies] = useState<Option[]>(); 
  const [selectedCompany, setSelectedCompany] = useState<Option>(); 
  const [years, setYears] = useState<Option[]>();
  const [firstSelectedYear, setFirstSelectedYear] = useState<Option>(); 
  const [secondSelectedYear, setSecondSelectedYear] = useState<Option>();
  const [termsSelectedYear, setTermsSelectedYear] = useState<Option>();
  const [termDetails, setTermDetails] = useState<any[]>();
  const [fetchYear, setFetchYear] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showTermModal, setShowTermModal] = useState<boolean>(false);
  const [hovered1, setHovered1] = useState(false);
  const [hovered2, setHovered2] = useState(false);
  const [dates, setDates] = useState<string[]>(new Array(8));
  const [selectedName, setSelectedName] = useState('');
  const navigate = useNavigate();

  const getAuthHeader = () => {
    const token = localStorage.getItem("accessToken");
    if (!token) {
        navigate("/login");
    }
    return {
        Authorization: `Bearer ${token}`,
    };
  };

  const firstOptions = getOptions(firstData)
  const secondOptions = getOptions(secondData)
  
  const handleShowTermModal = () => {
    setShowTermModal(true);
  };

  const handleCloseTermModal = () => {
    setShowTermModal(false);
  };

  const handleShowModal = () => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setDates(new Array(8));
    setShowModal(false);
  };

  const handleApprove = async () => {
    try {
      await axios.post(`/api/term`, {
        name: selectedName,
        midterm_fall_begin: dates[0],
        midterm_fall_end: dates[1],
        midterm_break_begin: dates[2],
        midterm_break_end: dates[3],
        midterm_spring_begin: dates[4],
        midterm_spring_end: dates[5],
        summer_begin: dates[6],
        summer_end: dates[7],
      }, {
        headers: getAuthHeader(),
      })
      setFetchYear(!fetchYear)
    }
    catch (e) {
    }
    handleCloseModal()
  };

  const handleNameChange = (e: any) => {
    setSelectedName(e.target.value);
  };

  const handleDateChange = (e: any, i: number) => {
    const updatedDates = [...dates];
    updatedDates[i] = e.target.value;
    setDates(updatedDates);
  };

  const getYears = async () => {
    try {
      const res = await axios.get(`/api/terms`, {
        headers: getAuthHeader()
      });
      setTermDetails(res.data);
      setYears(res.data.map((e: any, index: number) => ({
          name: e.name,
          value: index + 1,
      })))
      setFirstSelectedYear(res.data[0] ?? undefined);
      setSecondSelectedYear(res.data[0] ?? undefined);
      setTermsSelectedYear(res.data[0] ?? undefined);
    } catch (e) {
      setYears([]);
      setFirstSelectedYear(undefined);
      setSecondSelectedYear(undefined);
    }
  }

  const getCompanies = async () => {
    try {
      const data = await axios.get(`/api/chart/companies`, {
        headers: getAuthHeader()
      });
      setCompanies(data.data);
      setSelectedCompany(data.data[0] ?? undefined);
      
    } catch (e) {
      setCompanies([]);
      setSelectedCompany(undefined);
    }
  }

  const getInternships = async (year: string, setData: any, companyId?: any) => {
    try {
      let url = `/api/chart/internships?year=${year}`;
      let url1 = `/api/term-internships?year=${year}`;
      const res1 = await axios.get(url1, {
        headers: getAuthHeader()
      });
      console.log(res1.data)
      if (companyId) {
        url += `&company_id=${companyId}`;
      }

      const res = await axios.get(url, {
        headers: getAuthHeader()
      });
      setData(res.data)
    } catch (e) {
      setData([])
    }
  }

  useEffect(() => {
    if (firstSelectedYear) {
      getInternships(firstSelectedYear.name, setFirstData);
    }
  }, [firstSelectedYear])
  
  useEffect(() => {
    if (secondSelectedYear && selectedCompany) {
      getInternships(secondSelectedYear.name, setSecondData, selectedCompany.id);
    }
  }, [secondSelectedYear, selectedCompany])

  useEffect(() => {
    getYears();
  }, [fetchYear]);

  useEffect(() => {
    getCompanies();
  }, []);

  const formatTermDate = (i: number) => {
    const foundTerm = termDetails?.find((e:any)=>(e.name === termsSelectedYear?.name));
    if (foundTerm) {
      let specifiedTermDate: Date;
      switch (i) {
        case 0:
          specifiedTermDate = foundTerm.midterm_fall_begin;
          break;
        case 1:
          specifiedTermDate = foundTerm.midterm_fall_end;
          break;
        case 2:
          specifiedTermDate = foundTerm.midterm_break_begin;
          break;
        case 3:
          specifiedTermDate = foundTerm.midterm_break_end;
          break;
        case 4:
          specifiedTermDate = foundTerm.midterm_spring_begin;
          break;
        case 5:
          specifiedTermDate = foundTerm.midterm_spring_end;
          break;
        case 6:
          specifiedTermDate = foundTerm.summer_begin;
          break;
        case 7:
          specifiedTermDate = foundTerm.summer_end;
          break;
        default:
          return "";
      }
      if (specifiedTermDate) {
        return ((new Date(specifiedTermDate)).toLocaleDateString());
      }
    }

    return "";
  }

  return (
    <div className="w-max">
      <Modal 
        size="lg"
        show={showTermModal} 
        onHide={handleCloseTermModal}>
        <Modal.Header closeButton>
            <Modal.Title>Dönem Tarihleri</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{padding: "8px 16px 8px 16px"}}>
           {termDetails ? 
            <div className='grid-cols-2'>
              <div className="row align-items-center">
                <div className="col-4 col-lg-8" style={{padding: "0px 10px "}}>
                  <ChartFilter 
                    options={years}
                    onChange={(e: any) => {setTermsSelectedYear(years?.find((op: Option) => (op.value === Number(e.target.value))))}}
                  />
                </div>
              </div>
              <div className="row mt-2 align-items-center border-top border-1">
                <label className='mt-2 col-4' htmlFor="string">Yıl</label>
                <div className="mt-2 col-4 col-lg-8 text-nowrap">
                  {termsSelectedYear?.name}
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Dönem İçi Güz:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <span className="w-100">{formatTermDate(0)}</span>
                  <span className="w-100">{formatTermDate(1)}</span>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Ara Dönem:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <span className="w-100">{formatTermDate(2)}</span>
                  <span className="w-100">{formatTermDate(3)}</span>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Dönem İçi Bahar:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <span className="w-100">{formatTermDate(4)}</span>
                  <span className="w-100">{formatTermDate(5)}</span>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Yaz:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <span className="w-100">{formatTermDate(6)}</span>
                  <span className="w-100">{formatTermDate(7)}</span>
                </div>
              </div>
            </div>
           : <p>Veri Getirilemedi</p>}
          </Modal.Body>
        <Modal.Footer >
          <div></div>
        </Modal.Footer>
      </Modal>
      <Modal 
        size="lg"
        show={showModal} 
        onHide={handleCloseModal}>
        <Modal.Header closeButton>
            <Modal.Title>Dönem Tarihi Düzenleme</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <div className='grid-cols-2'>
              <div className="row mt-2 align-items-center">
                <label className='col-4' htmlFor="string">Yıl</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <input placeholder='20xx-20xx' className='w-100' type="text" id="text" value={selectedName} onChange={handleNameChange}/>
                </div>
              </div>
              <div className="row">
                <label className='col-4' htmlFor="date">Dönem İçi Güz:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <input className="w-100" type="date" id="date" value={dates[0]} onChange={(e:any) => {handleDateChange(e, 0)}}/>
                  <input className="w-100" type="date" id="date" value={dates[1]} onChange={(e:any) => {handleDateChange(e, 1)}}/>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Ara Dönem:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <input className="w-100" type="date" id="date" value={dates[2]} onChange={(e:any) => {handleDateChange(e, 2)}}/>
                  <input className="w-100" type="date" id="date" value={dates[3]} onChange={(e:any) => {handleDateChange(e, 3)}}/>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Dönem İçi Bahar:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <input className="w-100" type="date" id="date" value={dates[4]} onChange={(e:any) => {handleDateChange(e, 4)}}/>
                  <input className="w-100" type="date" id="date" value={dates[5]} onChange={(e:any) => {handleDateChange(e, 5)}}/>
                </div>
              </div>
              <div className="row mt-2">
                <label className='col-4' htmlFor="date">Yaz:</label>
                <div className='d-flex gap-2 col-4 col-lg-8'>
                  <input className="w-100" type="date" id="date" value={dates[6]} onChange={(e:any) => {handleDateChange(e, 6)}}/>
                  <input className="w-100" type="date" id="date" value={dates[7]} onChange={(e:any) => {handleDateChange(e, 7)}}/>
                </div>
              </div>
            </div>
        </Modal.Body>
        <Modal.Footer >
          <div style={{  display: "flex", gap: "10px" }}>
            <Button variant="secondary" onClick={handleCloseModal}>
            Vazgeç
            </Button>
            <Button variant="success" onClick={handleApprove}>
            Onayla
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
      <Card style={{
        borderRadius: "15px",
      }}>
      <div className="grid-container mt-1 align-items-center">
        <Button 
          size='sm'
          variant="outline-primary"
          className="buttonText mt-2"
          style={{
            borderRadius: "13px",
            backgroundColor: hovered1 ? '#1e293b' : '#ffffff',
            borderColor: "#1e293b",
            color: hovered1 ? '#ffffff' : '#1e293b',
          }}
          onMouseEnter={() => setHovered1(true)}
          onMouseLeave={() => setHovered1(false)}
          onClick={() => handleShowTermModal()}
        > 
          <div className='d-flex align-items-center gap-2'>
            <BsFillCalendar2DateFill fontSize={20} />
            <span>Dönem Tarihleri</span>
          </div>
        </Button>
        <Button 
          size='sm'
          variant="outline-primary"
          className="buttonText mt-2"
          style={{
            borderRadius: "13px",
            backgroundColor: hovered2 ? '#1e293b' : '#ffffff',
            borderColor: "#1e293b",
            color: hovered2 ? '#ffffff' : '#1e293b',
          }}
          onMouseEnter={() => setHovered2(true)}
          onMouseLeave={() => setHovered2(false)}
          onClick={() => handleShowModal()}
        >
          <div className='d-flex align-items-center gap-2'>
            <IoMdAddCircleOutline fontSize={20} />
            <span>Dönem Oluştur</span>
          </div>
        </Button>
      </div>
        <Chart 
          options={firstOptions} 
          icon={<VscGraph size={18}/>}
          head='Staj Durumu'
          style={{"margin-top": "4px", "padding": "0.5em 1em" }}
          filterLine={
            <ChartFilter 
              options={years}
              onChange={(e: any) => {setFirstSelectedYear(years?.find((op: Option) => (op.value === Number(e.target.value))))}}
            />
          }
        />
        <Chart 
          options={secondOptions} 
          icon={<VscGraph size={18}/>}
          head='Şirket Bazlı Staj Durumu'
          style={{"margin-bottom": "0.5em","padding": "0.5em 1em" }}
          filterLine={
            <div className="secondChartFilterLine">
              <ChartFilter 
                options={years}
                onChange={(e: any) => {setSecondSelectedYear(years?.find((op: Option) => (op.value === Number(e.target.value))))}}
              />
              <ChartFilter 
                options={companies}
                onChange={(e: any) => {setSelectedCompany(companies?.find((op: Option) => (op.value === Number(e.target.value))))}}
              />
            </div>
          }
        />
      </Card>
    </div>
  );
};

export default Dashboard;
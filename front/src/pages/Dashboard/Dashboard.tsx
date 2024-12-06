import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';
import Chart from './Chart';
import ChartFilter from './ChartFilter';
import { VscGraph } from "react-icons/vsc";
import axios from 'axios';

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
  
  const getYears = async () => {
    try {
      const res = await axios.get(`/api/chart/years`, {
        headers: getAuthHeader()
      });
      setYears(res.data)
      setFirstSelectedYear(res.data[0] ?? undefined);
      setSecondSelectedYear(res.data[0] ?? undefined);
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
    getCompanies();
  }, [])

  return (
    <div className="w-max">
      <Chart 
        options={firstOptions} 
        icon={<VscGraph size={18}/>}
        head='Staj Durumu'
        style={{"margin-top": "1em" }}
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
        style={{"margin-top": "1em" }}
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
    </div>
  );
};

export default Dashboard;
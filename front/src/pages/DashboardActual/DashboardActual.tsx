import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DashboardActual.css';
import Chart from './Chart';
import ChartFilter from './ChartFilter';
import axios from 'axios';
import { VscGraph } from "react-icons/vsc";

const passedColor = "#28b463";
const failedColor = "#e74c3c";

const staticData = {
  "midterm_fall": {
    "passed": 124,
    "failed": 14,
  },
  "midterm_break": {
    "passed": 204,
    "failed": 4,
  },
  "midterm_spring": {
    "passed": 124,
    "failed": 10,
  },
  "summer": {
    "passed": 304,
    "failed": 40,
  },
}

const staticCompanies: Option[] = [
  {
    name: "Aselsan",
    value: 1,
  },
  {
    name: "Havelsan",
    value: 2,
  },
  {
    name: "Türkcell",
    value: 3,
  },
  {
    name: "Türk Telekom",
    value: 4,
  },
  {
    name: "Türk Telekom aslfjh asıufd kjlasfdk asfkj",
    value: 5,
  },
]

const options: Option[] = [
  {
    name: "2013",
    value: 1,
  },
  {
    name: "2012",
    value: 2,
  },
  {
    name: "2011",
    value: 3,
  },
  {
    name: "2010",
    value: 4,
  },
]

const GraphXConversions = {
  "midterm_fall": "Dönem İçi 'Güz'",
  "midterm_break": "Ara Dönem",
  "midterm_spring": "Dönem İçi 'Bahar'",
  "summer": "Yaz Dönemi",
}

type Option = {
  value: number;
  name: string;
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

const DashboardActual: React.FC = () => {
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
      const data = await axios.get(`/chart/years`);
      //TODO: request
      // get
      
    } catch (e) {
      setYears(options);
      setFirstSelectedYear(options[0] ?? undefined);
      setSecondSelectedYear(options[0] ?? undefined);
    }
  }

  const getCompanies = async () => {
    try {
      const data = await axios.get(`/chart/companies`);
      //TODO: request
      // get
      
    } catch (e) {
      setCompanies(staticCompanies);
      setSelectedCompany(staticCompanies[0] ?? undefined);
    }
  }

  const getInternships = async (year: string, setData: any) => {
    try {
      const data = await axios.get(`/chart/internships?year=${year}`);
      //TODO: request
      // get
      // params: year

    } catch (e) {
      setData(staticData)
    }
  }

  useEffect(() => {
    if (firstSelectedYear) {
      getInternships(firstSelectedYear.name, setFirstData);
    }
  }, [firstSelectedYear])
  
  useEffect(() => {
    if (secondSelectedYear && selectedCompany) {
      getInternships(secondSelectedYear.name, setSecondData);
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

export default DashboardActual;
import React from "react";
import ReactECharts from "echarts-for-react";
import './ChartFilter.css';
import { Form } from "react-bootstrap";

const splitString = (str: string, length: number = 20) => {
    if (str.length > 20){
        return str.slice(0, length - 3) + "...";
    }
    return str;
}

type ChartFilterProps = {
    options?: any[]
    onChange?: any
}

const ChartFilter: React.FC<ChartFilterProps> = ({
    options, 
    onChange
}) => {
    return (
        <Form.Select 
            size='sm' 
            aria-label="Dönem Seçiniz"
            style={{ width: "200px" }}
            className="form-select chartFilter"
            onChange={onChange}
        >
            {options?.map((e) => (
                <option className="chartFilterOption" value={e.value}>{splitString(e.name)}</option>
            ))}
        </Form.Select>
    );
  };
  
  export default ChartFilter;
  
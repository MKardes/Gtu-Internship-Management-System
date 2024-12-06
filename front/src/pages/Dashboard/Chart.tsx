import React from "react";
import ReactECharts from "echarts-for-react";
import './Chart.css';

type ChartProps = {
    options: any;
    icon?: any;
    head?: string;
    style?: any;
    filterLine?: any;
}

const Chart: React.FC<ChartProps> = ({
  options,
  icon,
  style,
  head,
  filterLine
}) => {
    return (
      <div style={style}>
        <div className="card">
          <div className="chartHeader">
            <div style={{
                display: "flex",
                "alignItems": "center",
                gap: "10px"
            }}>
              {icon ?? null}
              <h2 className="chartHeaderText">{head}</h2>
            </div>
            {filterLine ?? null}
          </div>
          {options ?
            <ReactECharts option={options} style={{ height: 350, width: "100%" }} /> :
            <p className="emptyMessage">Veri bulunamadı</p>
          }
        </div>
      </div>
    );
  };
  
  export default Chart;
  
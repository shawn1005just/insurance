import { Col, Row } from "antd";
import Layout from "../../../components/Layout";
import Card from "../../../components/Card";
import { BarChartOutlined, PieChartOutlined } from "@ant-design/icons";
import ReactEcharts from "echarts-for-react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FcViewDetails } from "react-icons/fc";
import { assignedClaims } from "../../../store/claim";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "../../../store";
import { useEffect } from "react";

const option = {
  tooltip: {
    trigger: "item",
  },
  series: [
    {
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: false,
      itemStyle: {
        borderRadius: 10,
        borderColor: "#fff",
        borderWidth: 2,
      },
      label: {
        show: false,
        position: "center",
      },
      labelLine: {
        show: false,
      },
      data: [
        { value: 1048, name: "Approved" },
        { value: 735, name: "Declined" },
      ],
    },
  ],
};

const option1 = {
  legend: {},
  tooltip: {},
  dataset: {
    source: [
      ["product", "Approved", "Declined"],
      ["Jul", 43.3, 85.8],
      ["Aug", 83.1, 73.4],
      ["Sep", 86.4, 65.2],
    ],
  },
  xAxis: { type: "category" },
  yAxis: {},
  // Declare several bar series, each will be mapped
  // to a column of dataset.source by default.
  series: [{ type: "bar" }, { type: "bar" }],
};

interface DataType {
  key: string;
  weather: string;
  date: string;
  status: string;
  time: string;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Claim ID",
    dataIndex: "_id",
    key: "_id",
  },
  {
    title: "Claim Type",
    dataIndex: "weather",
    key: "weather",
  },
  {
    title: "Client Name",
    dataIndex: "client_name",
    key: "client_name",
  },
  {
    title: "Client Address",
    dataIndex: "client_address",
    key: "client_address",
  },
  {
    title: "Date of Change",
    dataIndex: "date",
    key: "date",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

const AssessedClaims: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { assessed } = useSelector((state: RootState) => state.claim);
  useEffect(() => {
    dispatch(assignedClaims());
  }, []);

  return (
    <Layout>
      <>
        <Row gutter={[0, 64]} className="mt-5 text-left">
          <Col span={24} md={12} className="p-4">
            <Card>
              <>
                <PieChartOutlined
                  style={{ fontSize: "48px" }}
                  className="absolute -top-6 right-6 p-2 bg-[#1f9978] rounded-md"
                />
                <p className="text-[24px]">Statistics</p>
                <div className="mt-5 mb-20">
                  <p className="p-2">Total number of claims : 120</p>
                  <p className="p-2">Approved claims : 70</p>
                  <p className="p-2">Denied claims : 50</p>
                </div>
                <ReactEcharts
                  option={option}
                  className="!w-[240px] !h-[240px] !absolute right-0 bottom-0"
                />
              </>
            </Card>
          </Col>
          <Col span={24} md={12} className="p-4">
            <Card>
              <>
                <BarChartOutlined
                  style={{ fontSize: "48px" }}
                  className="absolute -top-6 right-6 p-2 bg-[#1f9978] rounded-md"
                />
                <p className="text-[24px]">Last 3 months</p>
                <ReactEcharts option={option1} className="mt-4 !h-[250px]" />
              </>
            </Card>
          </Col>
        </Row>
        <div className="p-10">
          <div className="flex items-center text-black gap-2">
            <FcViewDetails className="w-8 h-8" />
            Claim Details
          </div>
          <Table
            className="mt-4"
            bordered
            columns={columns}
            dataSource={assessed}
          />
        </div>
      </>
    </Layout>
  );
};

export default AssessedClaims;

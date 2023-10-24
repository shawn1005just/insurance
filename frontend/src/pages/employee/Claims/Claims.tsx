import { useDispatch, useSelector } from "react-redux";
import Layout from "../../../components/Layout";
import { AppDispatch, RootState } from "../../../store";
import { allClaims } from "../../../store/claim";
import React, { useEffect } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { FcViewDetails } from "react-icons/fc";
import { getWeatherEvents } from "../../../store/weather";
import { TiWeatherPartlySunny } from "react-icons/ti";
import { PiWarningOctagonBold } from "react-icons/pi";

interface DataType {
  key: string;
  weather: string;
  date: string;
  status: string;
  time: string;
  raised_claims: number;
  confirmed_damage: number;
}

const columns: ColumnsType<DataType> = [
  {
    title: "Claim ID",
    dataIndex: "_id",
    key: "_id",
  },
  {
    title: "Weather Event",
    dataIndex: "weather",
    key: "weather",
  },
  {
    title: "Date Registered",
    dataIndex: "date",
    key: "date",
    render: (_date: Date) => {
      const date = new Date(_date);
      return (
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
      );
    },
  },
  {
    title: "Customer Name",
    dataIndex: "customer_name",
    key: "customer_name",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
];

const weather_columns: ColumnsType<DataType> = [
  {
    title: "Event ID",
    dataIndex: "_id",
    key: "_id",
  },
  {
    title: "Weather Event",
    dataIndex: "weather",
    key: "weather",
  },
  {
    title: "Area",
    dataIndex: "city",
    key: "city",
  },
  {
    title: "Date Registered",
    dataIndex: "date",
    key: "date",
    render: (_date: Date) => {
      const date = new Date(_date);
      return (
        date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
      );
    },
  },
  {
    title: "Url",
    dataIndex: "url",
    key: "url",
    render: () => "link",
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "Claims Raised",
    dataIndex: "raised_claims",
    key: "raised_claims",
  },
  {
    title: "Confirmed Damage",
    dataIndex: "confirmed_damage",
    key: "confirmed_damage",
    render: (_, record) => {
      if (record.raised_claims)
        return _ + "(" + (_ * 100) / record.raised_claims + "%)";
      else return _;
    },
  },
  {
    title: "Validator",
    key: "validator",
    render: (_, record) => {
      if (
        record.raised_claims &&
        (record.confirmed_damage * 100) / record.raised_claims < 1
      )
        return 'Required';
      else return "N/A";
    },
  },
];

const Claims: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { claims } = useSelector((state: RootState) => state.claim);
  const { weathers } = useSelector((state: RootState) => state.weather);
  useEffect(() => {
    dispatch(allClaims());
    dispatch(getWeatherEvents());
  }, []);

  return (
    <Layout>
      <div className="p-10">
        <div className="relative">
          <p className="absolute flex gap-2 items-center top-0 right-0 float-right border px-4 py-1.5 bg-[#53c4e0] rounded-md">
            <TiWeatherPartlySunny className="w-6 h-6" /> Active Weather Events :{" "}
            {
              weathers.filter((weather: any) => weather.status === "Active")
                .length
            }
          </p>
          <div className="flex items-center text-black gap-2">
            <FcViewDetails className="w-8 h-8" />
            Weather Events
          </div>
          <Table
            className="mt-4"
            bordered
            columns={weather_columns}
            dataSource={weathers}
            pagination={{ pageSize: 5 }}
          />
        </div>
        <div className="relative">
          <p className="absolute flex gap-2 items-center top-0 right-0 float-right border px-4 py-1.5 bg-[#831616] rounded-md">
            <PiWarningOctagonBold className="w-6 h-6" /> Pending claims :{" "}
            {claims.filter((claim: any) => claim.status === "Pending").length}
          </p>
          <div className="flex items-center text-black gap-2">
            <FcViewDetails className="w-8 h-8" />
            Claim Details
          </div>
          <Table
            className="mt-4"
            bordered
            columns={columns}
            dataSource={claims}
            pagination={{ pageSize: 5 }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default Claims;
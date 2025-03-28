import React from "react";

export const Chart = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative w-full h-full">{children}</div>;
};

export const ChartContainer = ({
  children,
  data,
}: {
  children: React.ReactNode;
  data: any[];
}) => {
  return React.Children.map(children, (child) => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { data });
    }
    return child;
  });
};

export const ChartTooltip = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};

export const ChartTooltipContent = () => {
  return <></>;
};

export const ChartLegend = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="absolute top-2 right-2 flex items-center space-x-2">
      {children}
    </div>
  );
};

export const ChartLegendItem = ({
  name,
  color,
}: {
  name: string;
  color: string;
}) => {
  return (
    <div className="flex items-center space-x-1">
      <span
        className="block h-2 w-2 rounded-full"
        style={{ backgroundColor: color }}
      ></span>
      <span className="text-sm">{name}</span>
    </div>
  );
};

export const ChartGrid = () => {
  return <></>;
};

export const ChartXAxis = ({ dataKey }: { dataKey: string }) => {
  return <></>;
};

export const ChartYAxis = () => {
  return <></>;
};

export const ChartArea = ({
  dataKey,
  fill,
  fillOpacity,
  stroke,
}: {
  dataKey: string;
  fill: string;
  fillOpacity: number;
  stroke: string;
}) => {
  return <></>;
};

export const ChartLine = ({
  dataKey,
  stroke,
  strokeWidth,
}: {
  dataKey: string;
  stroke: string;
  strokeWidth: number;
}) => {
  return <></>;
};

export const ChartBar = ({
  dataKey,
  fill,
}: {
  dataKey: string;
  fill: string;
}) => {
  return <></>;
};

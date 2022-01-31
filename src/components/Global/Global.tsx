import React from "react";
import "./Global.module.scss";

interface Props {
    children: React.ReactNode | React.ReactNode[];
}

const Global: React.FC<Props> = function ({ children }) {
    return <React.Fragment>{children}</React.Fragment>;
};

export default Global;

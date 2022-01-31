import React from "react";
import ReactDOM from "react-dom";
import App from "./App";
import { store } from "./app/store";
import { Provider } from "react-redux";
import Global from "./components/Global/Global";
import { BrowserRouter } from "react-router-dom";

ReactDOM.render(
    <React.StrictMode>
        <Provider store={store}>
            <Global>
                <BrowserRouter>
                    <App />
                </BrowserRouter>
            </Global>
        </Provider>
    </React.StrictMode>,
    document.getElementById("app")
);

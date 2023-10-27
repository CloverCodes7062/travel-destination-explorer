import React from "react";
import '../css/Background.css';

function Background({ children }){
    return (
        <div className="background">
            { children }
        </div>
    );
}

export default Background;
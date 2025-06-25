import React from 'react';
import styled from 'styled-components';

const Button = ({ bgColor, href }) => {
  return (
    <StyledWrapper bgColor={bgColor}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <button className="LinkedinBtn">
          <span className="svgContainer">
            <svg viewBox="0 0 24 24" height={24} width={24} xmlns="http://www.w3.org/2000/svg">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </span>
          <span className="BG" />
        </button>
      </a>
    </StyledWrapper>
  );
};

const StyledWrapper = styled.div`
  a {
    text-decoration: none;
  }

  .LinkedinBtn {
    width: 45px;
    height: 45px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background-color: transparent;
    position: relative;
    border-radius: 7px;
    cursor: pointer;
    transition: all 0.3s;
  }

  .LinkedinBtn .svgContainer {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: transparent;
    backdrop-filter: blur(4px);
    letter-spacing: 1px;
    border-radius: 10px;
    transition: all 0.3s;
    border: 1px solid rgba(156, 156, 156, 0.466);
  }

  .LinkedinBtn .BG {
    position: absolute;
    content: "";
    width: 100%;
    height: 100%;
    background: ${(props) => props.bgColor};
    z-index: -1;
    border-radius: 9px;
    pointer-events: none;
    transition: all 0.3s;
  }

  .LinkedinBtn:hover {
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  }

  .LinkedinBtn:hover .BG {
    transform: rotate(35deg);
    transform-origin: bottom;
  }

  .LinkedinBtn:hover .svgContainer {
    background-color: rgba(156, 156, 156, 0.466);
  }
`;

export default Button;

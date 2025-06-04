"use client"
import React from 'react';
import Image from 'next/image';
import styled from 'styled-components';

const Card = ({image}) => {
  return (
    <StyledWrapper>
      <div className="card">
        <Image src={image} alt="About Us" layout="fill" objectFit="cover" />
      </div>
    </StyledWrapper>
  );
};  

const StyledWrapper = styled.div`
  .card {
   width: 190px;
   height: 254px;
   border-radius: 30px;
   background: #212121;
   box-shadow: 15px 15px 30px rgb(25, 25, 25),
               -15px -15px 30px rgb(60, 60, 60);
  }`;

export default Card;

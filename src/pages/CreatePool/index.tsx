import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  Box,
} from "@material-ui/core";
import { GROVE_ADDR } from '../../abis/address'
import GroveTokenABI from '../../abis/GroveToken.json'

declare let window: any;

interface Props {
  account: any;
  page: any;
  totalreward: any;
  pendingreward: any;
  decimal: any;
  name: any;
  symbol: any;
  totalSupply: any;
  dailyvolume: any;
  holders: any;
  balance: any;
  price: any;
}

const CreatePool: React.FC<Props> = ({ account, page, price, totalreward, pendingreward, decimal, name, symbol, totalSupply, dailyvolume, holders, balance }) => {


  const onClaim = async () => {
    const tokenContract = new window.web3.eth.Contract(GroveTokenABI, GROVE_ADDR);
    try {
      await tokenContract.methods.claim().send({ from: account })
    }
    catch (error) {
      console.log(error);
    }
  }
  function numberWithCommas(x: string) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }
  return (
    <StyledContainer>

      <Paper width={'100%'} height={'fit-content'} maxWidth={'400px'}>
        <Box fontSize={'32px'}>Your Rewards</Box>
        <Box width={'250px'} height={'250px'} mx={'auto'} mt={'30px'}>
          <img src={'/images/grove.png'} alt={'logo'} width={'100%'} height={'100%'} />
        </Box>
        <Info mt={'20px'} display={'flex'} alignItems={'center'}>
          <Box width={'50px'} height={'50px'}>
            <img src={'/images/icon.webp'} alt={'logo'} width={'100%'} height={'100%'} />
          </Box>
          <Box ml={'20px'}>
            <Box color={'#a7afca'}>Balance</Box>
            <Box mt={'10px'}>{numberWithCommas((balance / 1000000).toFixed(2))}M {symbol}</Box>
          </Box>
        </Info>
        <Info mt={'20px'} display={'flex'} alignItems={'center'}>
          <Box width={'50px'} height={'50px'}>
            <img src={'/images/icon.webp'} alt={'logo'} width={'100%'} height={'100%'} />
          </Box>
          <Box ml={'20px'}>
            <Box color={'#a7afca'}>Balance Price</Box>
            <Box mt={'10px'}>${numberWithCommas((balance * price).toFixed(2))}</Box>
          </Box>
        </Info>
        <Info mt={'20px'} display={'flex'} alignItems={'center'}>
          <Box width={'50px'} height={'50px'}>
            <img src={'/images/icon.webp'} alt={'logo'} width={'100%'} height={'100%'} />
          </Box>
          <Box ml={'20px'}>
            <Box color={'#a7afca'}>Pending Rewards </Box>
            <Box mt={'10px'}>${numberWithCommas((pendingreward * price).toFixed(2))}</Box>
            {/* <Box>${numberWithCommas((pendingreward * price).toFixed(2))}</Box> */}
          </Box>

        </Info>
        <Box display={'flex'} justifyContent={'end'}>
          <StyledButton onClick={() => onClaim()} mt={'20px'} width={'fit-content'} >
            Claim
          </StyledButton>
        </Box>
      </Paper>
      <Box ml={'50px'} maxWidth={'750px'} width={'100%'}>
        <Paper height={'fit-content'} width={'100%'}>
          <Box fontSize={'32px'} mt={'10px'}>Token Info</Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Name
            </Box>
            <Box>
              {name.length ? name : 'Grove Token'}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Symbol
            </Box>
            <Box>
              {symbol.length ? symbol : 'GVR'}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Decimal
            </Box>
            <Box>
              {decimal}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Price
            </Box>
            <Box>
              ${price.toFixed(10)}
            </Box>
          </Box>

        </Paper>
        <Paper height={'fit-content'} mt={'50px'} width={'100%'}>
          <Box fontSize={'32px'} mt={'10px'}>Project Info</Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Market Cap
            </Box>
            <Box>
              ${numberWithCommas((totalSupply * price).toFixed(2))}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Holders
            </Box>
            <Box>
              {numberWithCommas(Math.max(holders - 400, 0).toString())}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Daily Volume
            </Box>
            <Box>
              ${numberWithCommas((dailyvolume * price).toFixed(2))}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Reward Token
            </Box>
            <Box>
              Grove
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Total Rewards
            </Box>
            <Box>
              {numberWithCommas((totalreward / 1000000000).toFixed(2))} B {symbol}
            </Box>
          </Box>
          <Box display={'flex'} justifyContent={'space-between'} fontSize={'24px'} mt={'20px'}>
            <Box color={'lightgray'}>
              Total Rewards Price
            </Box>
            <Box>
              ${numberWithCommas((totalreward * price).toFixed(2))}
            </Box>
          </Box>
        </Paper>
      </Box>
    </StyledContainer>
  );
};
const Info = styled(Box)`
  background-image: linear-gradient(106.91deg,hsla(0,0%,100%,.15) 30.28%,hsla(0,0%,100%,0) 119.6%);;
  color white;
  padding: 20px;
  border-radius 10px;
  font-size 18px;
  width : 100%;
`;
const Paper = styled(Box)`
  width fit-content;
  box-shadow 0 0px 20px 0 rgb(64 75 151), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
  padding :  30px 50px;
  border-radius 12px;
  background: rgb(23 34 108 / 60%);
  @media screen and (max-width : 450px){
    padding : 30px 20px;
  }
  @media screen and (max-width : 530px){
    >div:nth-child(1){
      font-size : 24px!important;
    }
  }
`;
const StyledContainer = styled(Box)`
  display flex;
  min-height: 100vh;
  width: 100%;
  background-image: url("/images/background.jpg");
  background-size 100% 100%;
  position: relative;
  padding 0px 100px;
  padding-top: 150px;
  padding-bottom 50px;
  color white;
  justify-content center;
  overflow hidden;
  @media screen and (max-width : 1250px){
    flex-direction : column;
    align-items : center;
    background-color : white;
    background-repeat : repeat-y;
    background-position : top;
    background-size : unset;
    >div:nth-child(1){
      width : 100%;
      max-width : 750px;
    }
    >div:nth-child(2){
      margin-left : 0;
      margin-top : 60px;
    }
  }
  @media screen and (max-width : 700px){
    padding-left : 20px;
    padding-right : 20px;
  }
  @media screen and (max-width : 530px){
    >div:nth-child(2)>div>div{
      font-size : 18px;
    }
  }
`;
const StyledButton = styled(Box)`
    border 2px solid rgb(98,106,146);
    padding 12px 30px;
    font-size 24px;
    border-radius 10px;
    cursor pointer;
    transition all 0.3s;
   hover{
        background rgb(98,106,146);
    }
`
export default CreatePool;

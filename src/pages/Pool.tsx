import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    Box,
    Checkbox,
    InputAdornment,
    MenuItem,
    OutlinedInput,
    TextField,
} from "@material-ui/core";
import { GROVE_ADDR, GROVE_UNLOCK, GROVE_LOCK } from '../abis/address'
import ERC20ABI from '../abis/ERC20ABI.json'
import UnLockABI from '../abis/UnLockABI.json'
import LockABI from '../abis/LockABI.json'
import PancakePairABI from '../abis/PancakePairABI.json';
import Modal from 'react-modal';
import axios from 'axios';
import { BsAlarm } from 'react-icons/bs'
import { CgArrowsExchangeAlt } from 'react-icons/cg'
import { MdOutlineClose } from 'react-icons/md'
import Web3 from "web3";
import { Skeleton } from "@material-ui/lab";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AiOutlineCalculator } from 'react-icons/ai'
import { RiShareBoxLine } from 'react-icons/ri';
import { BiLockAlt } from 'react-icons/bi';
import RowPool from './RowPool';
import CardPool from './CardPool';

declare let window: any;

interface Props {
    account: any;
    pooldatas: any;
    tokenInfo: any;
    open: any;
    setOpen: any;
}


const Pool: React.FC<Props> = ({ account, pooldatas, tokenInfo, open, setOpen }) => {

    const [viewtype, setViewType] = useState(false);
    const [stakedonly, setStakedOnly] = useState(false);
    const [livefinish, setLiveFinish] = useState(false);

    return (
        <StyledContainer>
            <StrokePanel >
                <Box width={'fit-content'} mx={'auto'}>
                    <StrokeText><span>Shitty</span> Pools</StrokeText>
                    <Box fontSize={'12px'} color={'#404040'}>
                        Stake your $SFINU tokens to earn passive income.<br />
                        High APR, low risk.
                    </Box>
                </Box>
            </StrokePanel>
            <PoolPanel>
                <OptionPanel mt={'50px'}>
                    <Box display={'flex'} alignItems={'center'}>
                        <RowView onClick={() => setViewType(false)} active={viewtype} mr={'10px'} />
                        <CardView onClick={() => setViewType(true)} active={viewtype} mr={'30px'} />
                        <StakedOnlyPanel active={stakedonly} onClick={() => setStakedOnly(!stakedonly)}>
                            <Box />
                        </StakedOnlyPanel>
                        <Box ml={'5px'} fontSize={'11px'} color={'#56ced7'} mr={'25px'}>Staked Only </Box>
                        <LiveFinishPanel active={livefinish}>
                            <Box onClick={() => setLiveFinish(false)} width={'40%'}>Live</Box>
                            <Box onClick={() => setLiveFinish(true)} width={'60%'}>Finished</Box>
                        </LiveFinishPanel>
                    </Box>

                    <Box display={'flex'} alignItems={'center'}>
                        <Box mr={'10px'}>
                            <Box fontSize={'9px'} color={'#56ced7'}>SORT BY</Box>
                            <Dropdown width={'130px'} height={'31px'} >
                                <Box />
                                <Box color={'#fcb034'} pt={'3px'}>
                                    <FaChevronDown />
                                </Box>
                            </Dropdown>
                        </Box>

                        <Box>
                            <Box fontSize={'9px'} color={'#56ced7'}>SEARCH</Box>
                            <Criteria type='text' style={{ width: '163px', height: '31px' }} />
                        </Box>
                    </Box>
                </OptionPanel>

                {viewtype ? <RowPool pools={pooldatas} account={account} open={open} setOpen={setOpen} tokenInfo={tokenInfo} /> :
                    <CardPool pools={pooldatas} account={account} tokenInfo={tokenInfo} open={open} setOpen={setOpen} />}
            </PoolPanel>
        </StyledContainer >
    );
};
const StyledContainer = styled(Box)`
padding-top : 64px;
`;

const StrokeText = styled(Box)`
    font-family : none;
    font-size : 30px;
    font-weight : 400;
    color : #d3824a;
    font-style : italic;
    -webkit-text-stroke: 0.3px #363636;
    >span{
        color : white;
    }
`;
const StrokePanel = styled(Box)`
    padding-top : 20px;
    padding-bottom : 20px;
    background-image: linear-gradient(#fcb034, white);
 `;

const OptionPanel = styled(Box)`
    display : flex;
    justify-content: space-between;
    @media screen and (max-width : 900px){
        flex-direction : column;
        >div{
            margin-bottom : 10px;
        }
        margin-left : 30px;
    }
`;

const RowView = styled(Box) <{ active: boolean }>`
    width : 18px;
    height : 16px;
    background-size : 100% 100%;
    background-image : ${({ active }) => !active ? `url('/images/pools/rowviewinactive.png')` : `url('/images/pools/rowviewactive.png')`};
    cursor : pointer;
`;

const CardView = styled(Box) <{ active: boolean }>`
    width : 18px;
    height : 16px;
    background-size : 100% 100%;
    background-image : ${({ active }) => active ? `url('/images/pools/cardviewinactive.png')` : `url('/images/pools/cardviewactive.png')`};
    cursor : pointer;
`;

const StakedOnlyPanel = styled(Box) <{ active: boolean }>`
    background-color : ${({ active }) => !active ? '#ffe4b8' : '#56ced7'};
    width : 35px;
    height : 15px;
    position : relative;
    border-radius : 20px;
    >div{
        width : 13px;
        height : 13px;
        background-color : white;
        position : absolute;
        top : 1px;
        left : ${({ active }) => !active ? '1px' : '21px'};
        transition : all 0.2s;
        border-radius : 50%;
    }
    cursor:pointer;
`;

const LiveFinishPanel = styled(Box) < { active: boolean } >`
    width : 114px;
    height : 26px;
    background-color : #ffe6bc;
    border : 1px solid #ffd48d;
    border-radius : 20px;
    cursor : pointer;
    display : flex;
    >div{
        display : flex;
        justify-content : center;
        align-items: center;
        font-size : 11px;
    }
    >div:nth-child(1){
        background-color : ${({ active }) => !active ? '#fcb034' : 'transparent'};
        color : ${({ active }) => !active ? 'white' : '#fcb034'};
        border-radius : 20px; 
    }
    >div:nth-child(2){
        background-color : ${({ active }) => active ? '#fcb034' : 'transparent'};
        color : ${({ active }) => active ? 'white' : '#fcb034'};
        border-radius : 20px; 
    }
`;

const Dropdown = styled(Box)`
    background-color : #ffe6bc;
    border-radius : 8px;
    border-color : 1px solid #ffd48d;
    display :flex;
    justify-content : space-between;
    padding : 5px 8px;
    cursor : pointer;
`;

const Criteria = styled.input`
    background-color : #ffe6bc;
    border-radius : 8px;
    border : 1px solid #ffd48d!important;
    padding : 5px;
    outline:none;
    color : #56ced7;
    font-size : 12px;
`;


const PoolPanel = styled(Box)`
    max-width : 875px;
    margin : 0 auto;
    @media screen and (max-width : 900px){
        max-width : calc(100vw - 40px);
    }
`;

export default Pool;

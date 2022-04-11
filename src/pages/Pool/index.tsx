import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import {
    Box,
} from "@material-ui/core";

import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
    const [criteria, setCriteria] = useState('');
    const [dropdownopen, setDropDownOpen] = useState(false);
    const [sort, setSort] = useState('APR');
    const [pools, setPools] = useState(pooldatas);

    const dropdown = useRef<any>();

    useEffect(() => {
        document.addEventListener('mouseup', function (event) {
            if (dropdown.current && !dropdown.current.contains(event.target)) {
                setDropDownOpen(false);
            }
        });
    }, []);

    useEffect(() => {
        if (stakedonly) {
            let temp = [];
            for (let i = 0; i < pooldatas.length; i++)
                if (Number(pooldatas[i].stakingAmount) > 0)
                    temp.push(pooldatas[i]);
            setPools(temp);
        }
        else setPools(pooldatas);

    }, [stakedonly, pooldatas])

    useEffect(() => {
        let temp = [];
        for (let i = 0; i < pooldatas.length; i++)
            if ('sfinu'.includes(criteria.toLowerCase()) || 'bnb'.includes(criteria.toLowerCase()))
                temp.push(pooldatas[i]);
        setPools(temp);
    }, [criteria, pooldatas])

    useEffect(() => {
        let temp = pooldatas;
        if (sort === 'APR')
            for (let i = 0; i < temp.length - 1; i++)
                for (let j = i + 1; j < temp.length; j++)
                    if (temp[i].rate < temp[j].rate) {
                        const t = temp[i];
                        temp[i] = temp[j];
                        temp[j] = t;
                    }
        if (sort === 'Earned')
            for (let i = 0; i < temp.length - 1; i++)
                for (let j = i + 1; j < temp.length; j++)
                    if (temp[i].pendingReward < temp[j].pendingReward) {
                        const t = temp[i];
                        temp[i] = temp[j];
                        temp[j] = t;
                    }
        if (sort === 'Total Staked')
            for (let i = 0; i < temp.length - 1; i++)
                for (let j = i + 1; j < temp.length; j++)
                    if (temp[i].totalStaked < temp[j].totalStaked) {
                        const t = temp[i];
                        temp[i] = temp[j];
                        temp[j] = t;
                    }
        setPools(temp);

    }, [sort, pooldatas])

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
                            <Dropdown onClick={() => setDropDownOpen(!dropdownopen)} active={dropdownopen} ref={dropdown}>
                                <Box fontSize={'12px'} color={'#fcb034'}>{sort}</Box>
                                <Box color={'#fcb034'} pt={'6px'}>
                                    <FaChevronDown />
                                </Box>
                                <DropdownBody active={dropdownopen}>
                                    {sort !== 'APR' ? <Box onClick={() => setSort('APR')}>APR</Box> : ''}
                                    {sort !== 'Earned' ? <Box onClick={() => setSort('Earned')}>Earned</Box> : ''}
                                    {sort !== 'Total Staked' ? <Box onClick={() => setSort('Total Staked')}>Total Staked</Box> : ''}
                                </DropdownBody>
                            </Dropdown>
                        </Box>

                        <Box>
                            <Box fontSize={'9px'} color={'#56ced7'}>SEARCH</Box>
                            <Criteria type='text' style={{ width: '163px', height: '31px' }} value={criteria} onChange={(e) => setCriteria(e.target.value)} />
                        </Box>
                    </Box>
                </OptionPanel>

                {viewtype ? <RowPool pools={pools} account={account} open={open} setOpen={setOpen} tokenInfo={tokenInfo} /> :
                    <CardPool pools={pools} account={account} tokenInfo={tokenInfo} open={open} setOpen={setOpen} />}
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

const Dropdown = styled.div<{ active: boolean }>`
    width : 130px;
    height : 31px;
    background-color : #ffe6bc;
    border-radius : 8px;
    border-color : 1px solid #ffd48d;
    display :flex;
    justify-content : space-between;
    padding : 5px 8px;
    cursor : pointer;
    align-items : center;
    position : relative;
    border-bottom-left-radius : ${({ active }) => active ? '0px' : '8px'};
    border-bottom-right-radius : ${({ active }) => active ? '0px' : '8px'};
`;

const DropdownBody = styled(Box) <{ active: boolean }>`
    background-color : #ffe6bc;
    border-radius : 8px;
    border-top-left-radius : 0px;
    border-top-right-radius : 0px;
    left : 0;
    top : 30px;
    >div{
        padding : 5px 8px;
        cursor : pointer;
        color : #fcb034;
        font-size : 12px;
        transtion : all 0.2s;
        border-radius : 8px;
        :hover{ 
            background-color : #fcb034;
            color : white;
        }
    }
    position : absolute;
    transition : all 0.2s;
    width : 100%;
    height : ${({ active }) => active ? '58px' : '0'};
    overflow : hidden;
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

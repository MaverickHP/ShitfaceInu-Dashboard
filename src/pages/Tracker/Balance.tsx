import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    Box,
} from "@material-ui/core";
import { Skeleton } from "@material-ui/lab";
import { Shitface_BNB_ADDR } from "abis/address";

declare let window: any;

interface Props {
    account: any;
    dividendInfo: any;
    tokenInfo: any;
    withdrawn: any;
    tokentxlist: any;
    reserves: any;
    payouttxlist: any;
    tokenwholetxlist: any;
}

let zoomindex = 4;

const Tracker: React.FC<Props> = ({ account, dividendInfo, tokenInfo, withdrawn, tokentxlist, reserves, payouttxlist, tokenwholetxlist }) => {

    const rewardTitles = [
        'Total BNB Rewards Received',
        'Total Rewards Value in ~ USD',
        'Total Rewards Value in $SFINU'
    ];
    const rewardValues = [
        `${tokenToBNB(withdrawn, 7)} BNB`,
        `$${tokenToUSD(withdrawn, 5)} USD`,
        `${!withdrawn ? 'null' : numberWithCommas(Number(withdrawn).toFixed(2))} SFINU`
    ];

    const balanceTitles = [
        '$SFINU Balance',
        'Value in ~ USD',
        'Value in $BNB',
        'Last Payout Time'
    ];
    const balanceValues = [
        `${tokenBalance(tokenInfo ? tokenInfo.balance : tokenInfo, 2)}`,
        `$${tokenToUSD(tokenInfo ? tokenInfo.balance : tokenInfo, 5)}`,
        `$${tokenToBNB(tokenInfo ? tokenInfo.balance : tokenInfo, 5)}`,
        `${lastPayoutTime()}`
    ];

    function fetchTransactionData(tokentxlist: any, timetab: any) {
        let txcount = 0, sellcount = 0, buycount = 0, volume = 0;
        for (let i = 0; i < tokentxlist.length; i++) {
            if (tokentxlist[i].timeStamp >= new Date().getTime() / 1000 - timetab) {
                if (!tokentxlist[i].from || !tokentxlist[i].to) continue;
                txcount++;
                if (tokentxlist[i].to.toLowerCase() === Shitface_BNB_ADDR.toLowerCase()) {
                    sellcount++;
                }
                if (tokentxlist[i].from.toLowerCase() === Shitface_BNB_ADDR.toLowerCase()) {
                    buycount++;
                }
                volume += tokentxlist[i].value / Math.pow(10, 18);
            }
        }
        return { txcount, sellcount, buycount, volume };
    }
    function fetchPriceData(tokentxlist: any, day: number, pertime: number) {
        let reserve0 = Number(reserves._reserve0), reserve1 = Number(reserves._reserve1),
            priceBNB = Number(tokenInfo.price.price_BNB), price = Number(tokenInfo.price.price);
        let temp: any = [];
        for (let i = 0; i < tokentxlist.length; i++) {
            if (!tokentxlist[i].from || !tokentxlist[i].to) continue;
            if (tokentxlist[i].to.toLowerCase() === Shitface_BNB_ADDR.toLowerCase()) {
                reserve1 += tokentxlist[i].value / Math.pow(10, 18) * priceBNB;
                reserve0 -= tokentxlist[i].value / Math.pow(10, 18);
            }
            if (tokentxlist[i].from.toLowerCase() === Shitface_BNB_ADDR.toLowerCase()) {
                reserve1 -= tokentxlist[i].value / Math.pow(10, 18) * priceBNB;
                reserve0 += tokentxlist[i].value / Math.pow(10, 18);
            }
            temp.push({
                timeStamp: tokentxlist[i].timeStamp,
                price: (reserve1 / reserve0 * (price / priceBNB)).toFixed(12)
            });
        }
        console.log("temp", temp);
        let temp1: any = [], temp2: any = [];
        for (let i = day - 1; i >= 0; i--) {
            const time = new Date().getTime() / 1000 - pertime * i;
            if (time < Number(temp[temp.length - 1].timeStamp)) {
                continue;
            }
            let f = 0;
            for (let j = 0; j < temp.length - 1; j++) {
                if (temp[j].timeStamp >= time && time >= temp[j + 1].timeStamp) {
                    temp1.push({
                        date: i % 6 === 0 ? `${i}H` : '',
                        price: temp[j].price
                    })
                    temp2.push([time * 1000, Number(temp[j].price)]);
                    f = 1;
                    break;
                }
            }
            if (f === 0) {
                temp1.push({ data: '0H', price: Number(tokenInfo.price.price).toFixed(12) })
                temp2.push([time * 1000, Number(tokenInfo.price.price)]);
            }
        }
        console.log(temp1);
        return { temp1, temp2 };
    }

    function tokenToBNB(amount: string, decimal: number) {
        if (!tokenInfo || !amount) return 'null';
        return numberWithCommas((Number(amount) * Number(tokenInfo.price.price_BNB)).toFixed(decimal));
    }

    function tokenToUSD(amount: string, decimal: number, reduce?: boolean) {
        if (!tokenInfo || !amount) return 'null';
        let temp = (Number(amount) * Number(tokenInfo.price.price));
        if (reduce)
            return reduceNumber(temp, decimal);
        return numberWithCommas(temp.toFixed(decimal));
    }

    function tokenBalance(amount: string, decimal: number) {
        if (!tokenInfo || !amount) return 'null';
        return numberWithCommas(Number(amount).toFixed(decimal));
    }


    function reduceNumber(value: number, decimal: number) {
        if (value >= 1000) return (value / 1000).toFixed(decimal) + 'K';
        else if (value >= 1000000) return (value / 1000000).toFixed(decimal) + 'M';
        return value.toFixed(decimal);
    }
    function lastPayoutTime() {
        if (!dividendInfo) return 'null';
        const lastClaimTime = (new Date().getTime() / 1000 - dividendInfo.lastClaimTime);
        const hour = Math.floor(lastClaimTime / 3600);
        const minute = Math.floor(lastClaimTime % 3600 / 60);
        const second = Math.floor(lastClaimTime % 60);
        return `${hour}:${minute}:${second}`
    }
    function numberWithCommas(x: string) {
        if (!x) return;
        const list = x.split('.')
        if (list.length > 1)
            return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + list[1];
        return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    
    return (

        <Box>
            <RewardPanel>
                {rewardTitles.map((data: any, i: any) => {
                    return <Panel type='primary' maxWidth={'409px'} width={'100%'} height={'140px'} padding={'15px'} display={'flex'} alignItems={'center'} justifyContent={'end'}>
                        <Box>
                            <Box fontSize={'29px'} color={'#404040'} display={'flex'} justifyContent={'end'}>
                                {rewardValues[i].split(' ')[0].includes('null') ?
                                    <Skeleton variant={'text'} width={'180px'} style={{ transform: 'unset' }} />
                                    : rewardValues[i].split(' ')[0]}
                                <Box mr={'10px'} />
                                <span style={{ color: '#56ced7' }}>{rewardValues[i].split(' ')[1]}</span>
                            </Box>
                            <Box fontSize={'14px'} color={'#fcb034'} textAlign={'right'}>
                                {data}
                            </Box>
                        </Box>
                    </Panel>
                })}
            </RewardPanel>

            <BalancePanel >
                {balanceTitles.map((data: any, i: any) => {
                    return <Panel type='secondary' maxWidth={'299px'} width={'100%'} height={'114px'} padding={'15px'} display={'flex'} alignItems={'center'} justifyContent={'center'} flexDirection={'column'}>
                        <Box fontSize={'29px'} color={'#404040'}>
                            {balanceValues[i].split(' ')[0].includes('null') ?
                                <Skeleton variant={'text'} width={'180px'} style={{ transform: 'unset' }} />
                                : balanceValues[i].split(' ')[0]}
                        </Box>
                        <Box fontSize={'19px'} color={'#56ced7'}>
                            {data}
                        </Box>
                    </Panel>
                })}
            </BalancePanel>
        </Box>
    );
};

const Panel = styled(Box) <{ type: string }>`
    background-color : ${({ type }) => type === 'primary' ? '#f4fdfe' : '#fefbf4'};
    border : 2px solid;
    border-color : ${({ type }) => type === 'primary' ? '#56ced7' : '#fcb034'};
    border-radius : 30px;
    @media screen and (max-width : 1250px){
        max-width : calc(100% - 40px)!important;
    }
`

const RewardPanel = styled(Box)`
    display : flex;
    justify-content : space-between;
    margin-top : 70px;
    @media screen and (max-width : 1250px){
        flex-direction : column;
        align-items:center;
        >div{
            margin-bottom : 20px;
            justify-content : center;
        }
        >div>div>div:nth-child(2){
            text-align : center;
        }
    }
`

const BalancePanel = styled(Box)`
    display={'flex'} justifyContent={'space-between'} mt={'25px'}
    display : flex;
    justify-content : space-between;
    margin-top : 25px;
    @media screen and (max-width : 1250px){
        flex-direction : column;
        align-items : center;
        >div{
            margin-bottom : 20px;
        }
    }
`;
export default Tracker;

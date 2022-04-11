import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    Box,
} from "@material-ui/core";
import { PieChart } from 'react-minimal-pie-chart';
import { Skeleton } from "@material-ui/lab";
import { Shitface_BNB_ADDR } from "abis/address";
import PriceChart from '../../components/Tracker/PriceChart'
import HighchartsReact from 'highcharts-react-official';
import Highcharts from 'highcharts/highstock';
import {
    AreaChart,
    Area,
    Line,
    ResponsiveContainer,
    Bar,
    BarChart,
    ComposedChart,
    CartesianGrid,
    Tooltip,
    LineChart,
    XAxis,
    YAxis,
} from 'recharts'

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


    const [txinfo, setTxInfo] = useState<any>(null);
    const [timetab, setTimeTab] = useState(300);
    const [pricedata, setPriceData] = useState<any>([]);
    const [pricepercent, setPricePercent] = useState<any>([]);
    const [txdailydata, setTxDailyData] = useState<any>(null);
    const [tokenPriceList, setTokenPriceList] = useState<any>([]);
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

    useEffect(() => {
        if (!tokentxlist) return;
        const _txinfo = fetchTransactionData(tokentxlist, timetab)
        setTxInfo(_txinfo);
        setTxDailyData(fetchTransactionData(tokentxlist, 24 * 3600));
    }, [tokentxlist, timetab])

    useEffect(() => {
        if (!tokenwholetxlist || !tokentxlist || !reserves || !tokenInfo) return;
        let _pricedata = [];
        _pricedata.push(fetchPriceData(tokentxlist, 5 / 12 + 1, 3600).temp1);
        _pricedata.push(fetchPriceData(tokentxlist, 1, 3600).temp1);
        _pricedata.push(fetchPriceData(tokentxlist, 6, 3600).temp1);
        _pricedata.push(fetchPriceData(tokentxlist, 24, 3600).temp1);
        _pricedata.push(fetchPriceData(tokenwholetxlist, 7, 3600 * 24).temp1);
        _pricedata.push(fetchPriceData(tokenwholetxlist, 30, 3600 * 24).temp1);
        _pricedata.push(fetchPriceData(tokenwholetxlist, 365, 3600 * 24).temp1);
        let temp = []
        for (let i = 0; i < 7; i++) {
            const percent = (tokenInfo.price.price - _pricedata[i][0].price) / tokenInfo.price.price * 100;
            temp.push(percent);
        }
        setPricePercent(temp);
    }, [tokenwholetxlist, tokentxlist, reserves, tokenInfo]);

    useEffect(() => {
        if (!tokentxlist || !reserves || !tokenInfo) return;
        const _pricedata = fetchPriceData(tokentxlist, 24, 3600).temp1;
        setPriceData(_pricedata);
    }, [tokentxlist, reserves, tokenInfo])

    useEffect(() => {
        if (!tokenwholetxlist || !reserves || !tokenInfo || tokenPriceList.length) return;
        const _pricelist = fetchPriceData(tokenwholetxlist, 365 * 4, 3600 * 3).temp2;
        console.log("!!!!!");
        setTokenPriceList(_pricelist);
    }, [tokenwholetxlist, reserves, tokenInfo])

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

    function BNBToUSD(amount: string, decimal: number) {
        if (!tokenInfo || !amount) return 'null';
        return numberWithCommas((Number(amount) * Number(tokenInfo.price.price / tokenInfo.price.price_BNB)).toFixed(decimal));
    }

    function totalLiquidity(amount1: string, amount2: string, decimal: number, reduce?: boolean) {
        if (!tokenInfo || !amount1 || !amount2) return 'null';
        let amount = (Number(amount2) * Number(tokenInfo.price.price / tokenInfo.price.price_BNB) + (Number(amount1) * Number(tokenInfo.price.price)));
        if (reduce)
            return numberWithCommas(reduceNumber(amount, decimal));
        return numberWithCommas(amount.toFixed(decimal));
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

    function reduceAddress(account: string, decimal: number) {
        return account.slice(0, decimal) +
            "..." +
            account.substring(account.length - decimal, account.length)
    }

    const getOption1 = () => {

        const option = {
            xAxis: [
                {
                    labels: {
                        style: { color: "#9D9FC3" }
                    },
                }],
            yAxis: {
                gridLineColor: '#E6E7F9',
                labels: {
                    format: '${value:.4f}',
                    style: { color: "#9D9FC3" }
                },
                offset: 60,
                tickLength: 60,
                tickPosition: "outside",
            },
            chart: {
                backgroundColor: 'transparent',

            },
            credits: {
                enabled: false
            },

            scrollbar: { enabled: false },
            rangeSelector: {
                inputEnabled: true,
                inputLabel: true,
                labelStyle: {
                    display: 'none'
                },
                allButtonsEnabled: true,
                xAxis: {
                    minRange: 3600000,
                },
                selected: zoomindex,
                buttons: [
                    {
                        type: 'hour',
                        count: 24,
                        text: '1d',
                        events: {
                            click() {
                                zoomindex = 0;
                            }
                        }
                    },
                    {
                        type: 'day',
                        count: 7,
                        text: '7d',
                        events: {
                            click() {
                                zoomindex = 1;
                            }
                        }
                    }, {
                        type: 'month',
                        count: 1,
                        text: '1m',
                        events: {
                            click() {
                                zoomindex = 2;
                            }
                        }

                    }, {
                        type: 'month',
                        count: 3,
                        text: '3m',
                        events: {
                            click() {
                                zoomindex = 3;
                            }
                        }
                    }, {
                        type: 'all',
                        text: 'All',
                        events: {
                            click() {
                                zoomindex = 4;
                                // fetchData()
                            }
                        }
                    }],

            },

            plotOptions: {
                series: {
                    showInLegend: false,
                    animation: false
                }
            },
            tooltip: {
                split: false,
                shared: true,
                x: XAxis,
                y: YAxis,
                formatter: function () {
                    var tooltip = '<div style="color:#00DBE3;">' + '$' + Number(this.y).toFixed(12) + '</div><br/>';
                    var temp = Highcharts.dateFormat('%b %eth %Y, %H:%M', Number(this.x));
                    tooltip += `<div style = "color : #C4C4F6; padding-top : 10px;">${temp}</div>`;
                    return tooltip;
                },
                style: { opacity: 0.9 },
                padding: 10,
                backgroundColor: "#040218",
            },
            series: [{
                // type: 'line',
                data: tokenPriceList
            }],
            colors: ['#00DBE3', '#50B432', '#ED561B', '#DDDF00', '#24CBE5', '#64E572', '#040218', '#040218', '#6AF9C4'],
        };

        return option
    }
    return (
        <StyledContainer>
            <Box width={'fit-content'} mx={'auto'}>
                <StrokeText><span>Shitty</span> Tracker</StrokeText>
                <Box width={'260px'} fontSize={'12px'} color={'#404040'}>
                    Track everything you need to know about Shitface Inu, all in one place
                </Box>
            </Box>
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

                <LiveChartPanel>
                    <Panel type={'primary'} display={'flex'} justifyContent={'center'} width={'100%'} alignItems={'center'} maxWidth={'890px'} flexDirection={'column'} minHeight={'259px'}>
                        {!tokenPriceList.length ?
                            <>
                                <Box color={'#404040'} fontSize={'80px'} lineHeight={'102px'}>LIVE CHART HERE</Box>
                                <Box color={'#fcb034'} fontSize={'27px'}>SFINU / WBNB PCS V2</Box>
                            </> :
                            <Box width={'90%'} mx={'auto'}>
                                <ResponsiveContainer>
                                    <HighchartsReact containerProps={{ style: { width: "100%" } }} highcharts={Highcharts} options={getOption1()} constructorType='stockChart' />
                                </ResponsiveContainer>
                            </Box>
                        }
                    </Panel>

                    <Panel type={'primary'} width={'100%'} maxWidth={'390px'} flexDirection={'column'} padding={'10px 30px'} color={'#404040'} fontSize={'14px'} height={'fit-content'}>
                        <Box fontSize={'18px'}>$SFINU / WBNB</Box>
                        <Box display={'flex'} justifyContent={'space-between'} mt={'5px'} flexWrap={'wrap'}>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>PRICE USD</Box>
                                <Box display={'flex'}>
                                    ${tokenToUSD('1', 10)?.includes('null') ?
                                        <Skeleton variant={'text'} width={'80px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                        : tokenToUSD('1', 10)}
                                </Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>PRICE</Box>
                                <Box display={'flex'}>{tokenToBNB('1', 12)?.includes('null') ?
                                    <Skeleton variant={'text'} width={'80px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                    : tokenToBNB('1', 12)} WBNB</Box>
                            </Box>
                        </Box>
                        <Box display={'flex'} justifyContent={'space-between'} mt={'5px'}>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>LIQUIDITY</Box>
                                <Box display={'flex'}>${BNBToUSD(reserves ? reserves._reserve1 : reserves, 1)?.includes('null') || tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                    totalLiquidity(reserves._reserve0, reserves._reserve1, 1, true)
                                }</Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>FDV</Box>
                                <Box display={'flex'}>${tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 1)?.includes('null') || tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                    tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 1, true)
                                }</Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>MKT CAP</Box>
                                <Box display={'flex'}>${tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 1)?.includes('null') || tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                    tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 1, true)
                                }</Box>
                            </Box>
                        </Box>
                        <Box display={'flex'} justifyContent={'space-between'} mt={'5px'}>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>5M</Box>
                                <Box
                                    display={'flex'}
                                    color={(pricepercent.length ? pricepercent[0] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[0].toFixed(2) :
                                        <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                </Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>1H</Box>
                                <Box
                                    display={'flex'}
                                    color={(pricepercent.length ? pricepercent[1] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[1].toFixed(2) :
                                        <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                </Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>6H</Box>
                                <Box
                                    display={'flex'}
                                    color={(pricepercent.length ? pricepercent[2] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[2].toFixed(2) :
                                        <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                </Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} fontSize={'12px'}>24H</Box>
                                <Box
                                    display={'flex'}
                                    color={(pricepercent.length ? pricepercent[3] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[3].toFixed(2) :
                                        <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                </Box>
                            </Box>
                        </Box>

                        <TimeTab mt={'5px'}>
                            <TimeTabButton onClick={() => setTimeTab(300)} active={timetab === 300}>5M</TimeTabButton>
                            <TimeTabButton onClick={() => setTimeTab(3600)} active={timetab === 3600}>1H</TimeTabButton>
                            <TimeTabButton onClick={() => setTimeTab(3600 * 6)} active={timetab === 3600 * 6}>6H</TimeTabButton>
                            <TimeTabButton onClick={() => setTimeTab(3600 * 24)} active={timetab === 3600 * 24}>24H</TimeTabButton>
                        </TimeTab>
                        <Box display={'flex'} justifyContent={'space-between'} fontSize={'12px'} mt={'5px'}>
                            <Box>
                                <Box color={'rgb(155,155,155)'} >TXNS</Box>
                                <Box>{txinfo ? numberWithCommas(txinfo.txcount.toString()) :
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                }</Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} >BUYS</Box>
                                <Box>{txinfo ? numberWithCommas(txinfo.buycount.toString()) :
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                }</Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} >SELLS</Box>
                                <Box>{txinfo ? numberWithCommas(txinfo.sellcount.toString()) :
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                }</Box>
                            </Box>
                            <Box>
                                <Box color={'rgb(155,155,155)'} >VOLUME</Box>
                                <Box display={'flex'}>${tokenToUSD(txinfo ? txinfo.volume.toString() : txinfo, 0)?.includes('null') ?
                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                    tokenToUSD(txinfo ? txinfo.volume.toString() : txinfo, 0, true)}
                                </Box>
                            </Box>
                        </Box>
                    </Panel>
                </LiveChartPanel>
                <LiquidityPanel mt={'25px'} width={'100%'}>
                    <Panel type={'secondary'} width={'100%'} flexDirection={'column'} padding={'23px 36px'} color={'#404040'} height={'fit-content'} mx={'auto'}>
                        <Box mx={'auto'} width={'fit-content'} color={'#56ced7'} fontSize={'27px'}>ShitFace Inu Liquidity Pool Data</Box>
                        <Box display={'flex'}>
                            <Box mt={'30px'} width={'40%'}>
                                <Box width={'316px'} fontSize={'8px'}>
                                    <PieChart
                                        label={(props) => { return props.dataEntry.title; }}
                                        startAngle={90}
                                        data={[
                                            {
                                                title: `${(reserves && tokenInfo ? reserves._reserve0 * tokenInfo.price.price / (reserves._reserve1 * tokenInfo.price.price / tokenInfo.price.price_BNB + reserves._reserve0 * tokenInfo.price.price) * 100 : 50).toFixed(0)}%`,
                                                value: reserves && tokenInfo ? reserves._reserve0 * tokenInfo.price.price : 1,
                                                color: '#56ced7'
                                            },
                                            {
                                                title: `${(reserves && tokenInfo ? reserves._reserve1 * tokenInfo.price.price / tokenInfo.price.price_BNB / (reserves._reserve1 * tokenInfo.price.price / tokenInfo.price.price_BNB + reserves._reserve0 * tokenInfo.price.price) * 100 : 50).toFixed(0)}%`,
                                                value: reserves && tokenInfo ? reserves._reserve1 * tokenInfo.price.price / tokenInfo.price.price_BNB : 1,
                                                color: '#fcb134'
                                            },
                                        ]}
                                    />
                                </Box>
                            </Box>
                            <Box width={'60%'} maxWidth={'600px'} mt={'20px'}>
                                <Box display={'flex'} justifyContent={'space-between'}>
                                    <Box>
                                        <Box fontSize={'14px'} color={'#56ced7'}>
                                            Pool Token Amount
                                        </Box>
                                        <Box fontSize={'21px'} display={'flex'}>
                                            {tokenBalance(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'200px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                                : tokenBalance(reserves ? reserves._reserve0 : reserves, 4)}
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Box fontSize={'14px'} color={'#fcb134'}>Pool Token Value (USD)</Box>
                                        <Box fontSize={'21px'} display={'flex'}>
                                            {tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'200px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                                : tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)} USD
                                        </Box>
                                    </Box>
                                </Box>

                                <Box display={'flex'} justifyContent={'space-between'}>
                                    <Box>
                                        <Box fontSize={'14px'} color={'#56ced7'}>
                                            Pool BNB Amount
                                        </Box>
                                        <Box fontSize={'21px'} display={'flex'}>
                                            {tokenBalance(reserves ? reserves._reserve1 : reserves, 4)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'200px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                                : tokenBalance(reserves ? reserves._reserve1 : reserves, 4)} BNB
                                        </Box>
                                    </Box>
                                    <Box>
                                        <Box fontSize={'14px'} color={'#fcb134'}>Pool BNB Value (USD)</Box>
                                        <Box fontSize={'21px'} display={'flex'}>
                                            {BNBToUSD(reserves ? reserves._reserve1 : reserves, 4)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'200px'} style={{ transform: 'unset', marginRight: '5px' }} />
                                                : BNBToUSD(reserves ? reserves._reserve1 : reserves, 4)} USD
                                        </Box>
                                    </Box>
                                </Box>
                                <Box>
                                    <Box fontSize={'14px'} color={'#fcb134'}>Total Liquidity in USD</Box>
                                    <Box fontSize={'21px'} display={'flex'}>
                                        {BNBToUSD(reserves ? reserves._reserve1 : reserves, 4)?.includes('null') || tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                            <Skeleton variant={'text'} width={'200px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                            totalLiquidity(reserves._reserve0, reserves._reserve1, 4)
                                        } USD
                                    </Box>
                                </Box>
                                <Box width={'100%'} bgcolor={'white'} borderRadius={'40px'} height={'fit-content'} border={'1px solid #56ced7'} mt={'10px'} padding={'10px 20px'}>
                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                        <Box display={'flex'} alignItems={'center'}>
                                            <LogoImage width={'40px'} height={'40px'}>
                                                <img src={'/logo.png'} width={'100%'} height={'100%'} alt={'logo'} />
                                            </LogoImage>
                                            <Box ml={'15px'}>
                                                <Box>Shitface Inu</Box>
                                                <Box color={'rgb(100,100,100)'} fontSize={'14px'}>SFINU/USD</Box>
                                            </Box>
                                        </Box>
                                        <Box textAlign={'right'}>
                                            <Box fontSize={'10px'} color={'rgb(150,150,150)'}>24h</Box>
                                            <Box>${tokenInfo ? Number(tokenInfo.price.price).toFixed(12) : 0}</Box>
                                            <Box
                                                fontSize={'14px'}
                                                color={(tokenInfo && pricedata.length ? (tokenInfo.price.price - pricedata[0].price) / tokenInfo.price.price * 100 : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}
                                            >
                                                {(tokenInfo && pricedata.length ? (tokenInfo.price.price - pricedata[0].price) / tokenInfo.price.price * 100 : 0).toFixed(2)}%
                                            </Box>
                                        </Box>
                                    </Box>
                                    <Box width={'100%'} height={'100px'} mt={'10px'}>
                                        <PriceChart data={pricedata} />
                                    </Box>
                                    <Box display={'flex'} justifyContent={'space-between'} fontSize={'12px'} lineHeight={1.3} px={'10px'} color={'rgb(150,150,150)'}>
                                        <Box width={'60px'}>
                                            <Box color={'rgb(150,150,150)'}>Week</Box>
                                            <Box
                                                display={'flex'}
                                                color={(pricepercent.length ? pricepercent[4] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[4].toFixed(2) :
                                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                            </Box>
                                        </Box>
                                        <Box width={'60px'} color={'rgb(150,150,150)'}>
                                            <Box>Month</Box>
                                            <Box
                                                display={'flex'}
                                                color={(pricepercent.length ? pricepercent[5] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[5].toFixed(2) :
                                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                            </Box>
                                        </Box>
                                        <Box width={'60px'} color={'rgb(150,150,150)'}>
                                            <Box>Year</Box>
                                            <Box
                                                display={'flex'}
                                                color={(pricepercent.length ? pricepercent[6] : 0) >= 0 ? 'rgb(46,229,162)' : 'rgb(255,55,72)'}>{(pricepercent.length ? pricepercent[6].toFixed(2) :
                                                    <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset' }} />)}%
                                            </Box>
                                        </Box>
                                        <Box width={'60px'} >
                                            <Box color={'rgb(150,150,150)'}>Rank</Box>
                                            <Box color={'rgb(64, 64, 64)'}>#12075</Box>
                                        </Box>
                                        <Box />
                                    </Box>
                                    <Box display={'flex'} justifyContent={'space-between'} fontSize={'12px'} lineHeight={1.3} mt={'5px'} px={'10px'}>
                                        <Box width={'60px'}>
                                            <Box color={'rgb(150,150,150)'}>Transp.Vol</Box>
                                            <Box display={'flex'}>${tokenToUSD(txdailydata ? txdailydata.volume.toString() : txdailydata, 0)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                                tokenToUSD(txdailydata ? txdailydata.volume.toString() : txdailydata, 0, true)}
                                            </Box>
                                        </Box>
                                        <Box width={'60px'}>
                                            <Box color={'rgb(150,150,150)'}>Volume</Box>
                                            <Box display={'flex'}>${tokenToUSD(txdailydata ? txdailydata.volume.toString() : txdailydata, 0)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                                tokenToUSD(txdailydata ? txdailydata.volume.toString() : txdailydata, 0, true)}
                                            </Box>
                                        </Box>
                                        <Box width={'60px'}>
                                            <Box color={'rgb(150,150,150)'}>ATH</Box>
                                            <Box>16%</Box>
                                        </Box>
                                        <Box width={'60px'}>
                                            <Box color={'rgb(150,150,150)'}>Mkt Cap</Box>
                                            <Box display={'flex'}>${tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 0)?.includes('null') || tokenToUSD(reserves ? reserves._reserve0 : reserves, 4)?.includes('null') ?
                                                <Skeleton variant={'text'} width={'50px'} style={{ transform: 'unset', marginRight: '5px' }} /> :
                                                tokenToUSD(tokenInfo ? tokenInfo.totalSupply : tokenInfo, 0, true)
                                            }</Box>
                                        </Box>
                                        <Box />
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Panel>
                </LiquidityPanel>
                <TxListPanel mt={'25px'}>
                    <Panel type={'primary'} width={'100%'} height={'fit-content'} padding={'20px 50px'} fontSize={'14px'} mx={'auto'}>
                        <Box fontSize={'27px'} textAlign={'center'} color={'#fcb134'} >Recent Dividend Payout List</Box>
                        {payouttxlist && payouttxlist.map((data: any, i: any) => {
                            return <Box mt={'25px'} display={'flex'} justifyContent={'space-between'}>
                                <Box minWidth={'200px'}>
                                    <Box color={'#56ced7'}>Txn Hash</Box>
                                    <Box >{reduceAddress(data.hash, 10)}</Box>
                                </Box>
                                <Box minWidth={'100px'}>
                                    <Box color={'#56ced7'}>Block #</Box>
                                    <Box>{numberWithCommas(data.blockNumber)}</Box>
                                </Box>
                                <Box minWidth={'200px'}>
                                    <Box color={'#56ced7'}>Payout Time</Box>
                                    <Box >{new Date(data.timeStamp * 1000).toLocaleDateString() + ' ' + new Date(data.timeStamp * 1000).toLocaleTimeString()}</Box>
                                </Box>
                                <Box minWidth={'120px'}>
                                    <Box color={'#56ced7'}>From</Box>
                                    <Box >{reduceAddress(data.from, 6)}</Box>
                                </Box>
                                <Box minWidth={'120px'}>
                                    <Box color={'#56ced7'}>To</Box>
                                    <Box >{reduceAddress(data.to, 6)}</Box>
                                </Box>
                                <Box minWidth={'150px'}>
                                    <Box color={'#56ced7'}>Payout Value (BNB)</Box>
                                    <Box >{numberWithCommas(Number(data.value / Math.pow(10, 18)).toFixed(5))}</Box>
                                </Box>
                            </Box>
                        })}
                    </Panel>
                </TxListPanel>
            </Box>
        </StyledContainer >
    );
};

const StyledContainer = styled(Box)`
    padding : 84px 0px 50px 0px;
    width : 100%;
    max-width : 1300px;
    margin : 0 auto;
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

const Panel = styled(Box) <{ type: string }>`
    background-color : ${({ type }) => type === 'primary' ? '#f4fdfe' : '#fefbf4'};
    border : 2px solid;
    border-color : ${({ type }) => type === 'primary' ? '#56ced7' : '#fcb034'};
    border-radius : 30px;
    @media screen and (max-width : 1250px){
        max-width : calc(100% - 40px)!important;
    }
`

const TimeTab = styled(Box)`
    display : flex;
    background-color : lightgrey;
`;

const TimeTabButton = styled(Box) <{ active: boolean }>`
    width : 25%;
    display : flex;
    justify-content : center;
    align-items : center;
    border : 1px solid lightgrey;
    padding : 5px;
    font-size : 12px;
    background-color : ${({ active }) => active ? 'transparent' : 'white'};
    cursor: pointer;
`;

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

const LiveChartPanel = styled(Box)`
    display : flex;
    align-items : center;
    justify-content : space-between;
    margin-top : 30px;
    height : fit-content;
    @media screen and (max-width : 1250px){
        flex-direction : column;
        align-items:center;
        height : fit-content;
        >div{
            margin-bottom : 20px;
        }
        >div:nth-child(1)>div:nth-child(1){
            font-size : 50px;
        }
    }
    @media screen and (max-width : 500px){
        >div:nth-child(1)>div:nth-child(1){
            font-size : 30px;
        }
        >div:nth-child(1)>div:nth-child(2){
            font-size : 22px;
        }
        >div:nth-child(2){
            padding-left : 20px;
            padding-right : 20px;
        }
    }
`

const TxListPanel = styled(Box)`
    @media screen and (max-width : 1250px){
        >div>div{
            flex-direction : column;
            align-items : center;
            >div{
                width : 350px;
            }
        }
    }
    @media screen and (max-width : 550px){
        >div{
            padding-left : 20px;
            padding-right : 20px;
           >div{
               font-size : 12px;
           }
           >div:nth-child(1){
               font-size : 27px;
           }
        }
        >div>div:nth-child(2)>div{
            min-width : unset;
            width : 290px;
        }
    }
`;

const LiquidityPanel = styled(Box)`
    @media screen and (max-width : 1000px){
        >div>div:nth-child(2){
            flex-direction : column;
            align-items : center;
            >div:nth-child(1){
                width : 100%;
                display : flex;
                justify-content : center;
            }
            >div:nth-child(2){
                width : 100%;
                @media screen and (max-width : 600px){
                    >div{
                        flex-direction : column;
                    }
                    >div:nth-child(4){
                        width : 100%;
                    }
                }
            }
        }
        >div{
            height : fit-content!important;
        }
    }
    @media screen and (max-width : 500px){
        >div{
            padding-left : 20px;
            padding-right : 20px;
        }
    }
`;
const LogoImage = styled(Box)`
    @media screen and (max-width : 450px){
        display : none;
    }
`;
export default Tracker;

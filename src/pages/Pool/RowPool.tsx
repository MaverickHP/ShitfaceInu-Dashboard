import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
    Box,
    Checkbox,
    InputAdornment,
    OutlinedInput,
} from "@material-ui/core";
import { Shitface_ADDR, First_Lock, Second_Lock, Manual_Lock } from '../../abis/address'

import ERC20ABI from '../../abis/ERC20ABI.json'
import ManualABI from '../../abis/ManualABI.json'
import LockABI from '../../abis/LockABI.json'
import Modal from 'react-modal';
import { BsAlarm } from 'react-icons/bs'
import { CgArrowsExchangeAlt } from 'react-icons/cg'
import { MdOutlineClose } from 'react-icons/md'
import Web3 from "web3";
import { Skeleton } from "@material-ui/lab";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { AiOutlineCalculator } from 'react-icons/ai'
import { RiShareBoxLine } from 'react-icons/ri';
import { BiLockAlt } from 'react-icons/bi';
import { BsChevronDown, BsChevronUp } from 'react-icons/bs'


declare let window: any;

interface Props {
    account: any;
    pools: any;
    open: any;
    setOpen: any;
    tokenInfo: any;
}
const compound = [
    [1135.04 / 252.24 / 252.24, 1074.30 / 252.24 / 252.24, 1010.83 / 252.24 / 252.24, 889.68 / 252.24 / 252.24],
    [1982.22 / 304.87 / 304.87, 1835.37 / 304.87 / 304.87, 1687.16 / 304.87 / 304.87, 1418.83 / 304.87 / 304.87],
    [2100.80 / 310.45 / 310.45, 1940.19 / 310.45 / 310.45, 1778.71 / 310.45 / 310.45, 1488.07 / 310.45 / 310.45]
]

const customStyles1 = {
    content: {
        top: 'calc(50% )',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        width: 'calc(100% - 20px)',
        maxWidth: '500px',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'Poppins',
        borderRadius: '20px'
    },
};

const customStyles = {
    content: {
        top: 'calc(50% )',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        height: 'calc(100vh - 150px)',
        width: '100%',
        maxWidth: '500px',
        transform: 'translate(-50%, -50%)',
        fontFamily: 'Poppins',
        borderRadius: '20px'
    },
};

const RowPool: React.FC<Props> = ({ account, pools, open, setOpen, tokenInfo }) => {

    const [showdetail, setShowDetail] = useState<any>([]);

    const [pending, setPending] = useState<boolean[]>([]);

    const [modaldata, setModalData] = useState({ modallocknum: 0, address: '', isStake: true, balance: 0 });
    const [modalopen, setModalOpen] = useState(false);
    const [amount, setAmount] = useState('0');

    const [calcmodal, setCalcModal] = useState(0);
    const [calcmodalopen, setCalcModalOpen] = useState(false);
    const [calcamount, setCalcAmount] = useState('0');
    const [stakeday, setStakeDay] = useState(365);
    const [compoundday, setCompoundDay] = useState(-1);
    const [showcalcdetail, setShowCalcDetail] = useState(false);
    const [compoundcalc, setCompoundCalc] = useState(false);
    const [calcshowtype, setCalcShowType] = useState(false);

    function tokenToUSD(amount: string, decimal: number) {
        if (!tokenInfo || !amount) return 'null';
        let temp = (Number(amount) * Number(tokenInfo.price.price));
        return numberWithCommas(temp.toFixed(decimal));
    }

    function BNBToUSD(amount: string, decimal: number) {
        if (!tokenInfo || !amount) return 'null';
        let temp = (Number(amount) * Number(tokenInfo.price.price) / Number(tokenInfo.price.price_BNB));
        return numberWithCommas(temp.toFixed(decimal));
    }

    function numberWithCommas(x: string) {
        if (!x) return '';
        const list = x.split('.')
        if (list.length > 1)
            return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",") + '.' + list[1];
        return list[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }

    const onApproveContract = async (type: number, address: string) => {
        let temp = [...pending];
        temp[type] = true;
        setPending(temp);
        try {
            const tokenContract = new window.web3.eth.Contract(ERC20ABI, Shitface_ADDR);
            await tokenContract.methods.approve(address, "115792089237316195423570985008687907853269984665640564039457584007913129639935").send({ from: account });
        }
        catch (error) {
            console.log(error);
        }
        temp = [...pending];
        temp[type] = false;
        setPending(temp);
    }

    const onConfirm = async () => {
        let _pending = [...pending];
        _pending[modaldata.modallocknum] = true;
        setPending(_pending);
        let temp = amount.split('.')[1];
        if (temp)
            temp = amount.slice(0, amount.length - 2);
        else temp = amount;
        try {
            if (modaldata.modallocknum === 0) {
                const ManualContract = new window.web3.eth.Contract(ManualABI, Manual_Lock);
                if (modaldata.isStake) {
                    await ManualContract.methods.deposit(Web3.utils.toWei(temp)).send({ from: account });
                }
                else
                    await ManualContract.methods.withdraw(Web3.utils.toWei(temp)).send({ from: account });
            }
            else {
                const LockContract = new window.web3.eth.Contract(LockABI, modaldata.address);
                if (modaldata.isStake) {
                    await LockContract.methods.deposit(Web3.utils.toWei(temp)).send({ from: account });
                }
                else
                    await LockContract.methods.withdraw(Web3.utils.toWei(temp)).send({ from: account });
            }
        }
        catch (error) {
            console.log(error);
        }
        _pending = [...pending];
        _pending[modaldata.modallocknum] = false;
        setPending(_pending);
    }

    const onCompoundReward = async (i: any) => {
        let _pending = [...pending];
        _pending[i] = true;
        setPending(_pending);
        try {
            if (i === 0) {
                const contract = new window.web3.eth.Contract(ManualABI, pools[i].address);
                await contract.methods.compoundReward().send({ from: account, value: pools[i].performanceFee });
            }
            else {
                const contract = new window.web3.eth.Contract(LockABI, pools[i].address);
                await contract.methods.compoundReward().send({ from: account, value: pools[i].performanceFee });
            }
        }
        catch (error) {
            console.log(error);
        }
        _pending = [...pending];
        _pending[i] = false;
        setPending(_pending);
    }
    const onCompoundReflection = async (i: any) => {
        let _pending = [...pending];
        _pending[i] = true;
        setPending(_pending);
        try {
            if (i === 0) {
                const contract = new window.web3.eth.Contract(ManualABI, pools[i].address);
                await contract.methods.compoundDividend().send({ from: account, value: pools[i].performanceFee });
            }
            else {
                const contract = new window.web3.eth.Contract(LockABI, pools[i].address);
                await contract.methods.compoundDividend().send({ from: account, value: pools[i].performanceFee });
            }
        }
        catch (error) {
            console.log(error);
        }
        _pending = [...pending];
        _pending[i] = false;
        setPending(_pending);
    }
    const onHarvestReward = async (i: any) => {
        let _pending = [...pending];
        _pending[i] = true;
        setPending(_pending);
        try {
            if (i === 0) {
                const contract = new window.web3.eth.Contract(ManualABI, pools[i].address);
                await contract.methods.claimReward().send({ from: account, value: pools[i].performanceFee });
            }
            else {
                const contract = new window.web3.eth.Contract(LockABI, pools[i].address);
                await contract.methods.claimReward().send({ from: account, value: pools[i].performanceFee });
            }
        }
        catch (error) {
            console.log(error);
        }
        _pending = [...pending];
        _pending[i] = false;
        setPending(_pending);
    }
    const onHarvestReflection = async (i: any) => {
        let _pending = [...pending];
        _pending[i] = true;
        setPending(_pending);
        try {
            if (i === 0) {
                const contract = new window.web3.eth.Contract(ManualABI, pools[i].address);
                await contract.methods.claimDividend().send({ from: account, value: pools[i].performanceFee });
            }
            else {
                const contract = new window.web3.eth.Contract(LockABI, pools[i].address);
                await contract.methods.claimDividend().send({ from: account, value: pools[i].performanceFee });
            }
        }
        catch (error) {
            console.log(error);
        }
        _pending = [...pending];
        _pending[i] = false;
        setPending(_pending);
    }

    const inputNumberFormat = (str: string) => {
        if (!str.length) {
            return '0';
        }

        let temp = str.split('.')[0];
        if (temp === '00' || str === '0')
            return '0';
        else if (temp === '0' && str.includes('.'))
            return str
        else
            return (str.replace(/^0+/, ''));
    }

    const CalculateRate = (i: any) => {
        if (compoundcalc)
            return Number(stakeday * pools[i]?.rate * pools[i]?.rate * compound[i][compoundday] / 36500);
        return Number(stakeday * pools[i]?.rate / 36500);
    }


    return (
        <PoolField mt={'10px'}>
            <Modal
                isOpen={calcmodalopen}
                onRequestClose={() => setCalcModalOpen(false)}
                style={customStyles}
                contentLabel="Example Modal"
            >
                <Box display={'flex'} justifyContent={'space-between'} mb={'20px'} fontSize={'24px'} py={'20px'} borderBottom={'2px solid rgb(231, 227, 235)'}>
                    <Box>
                        ROI Calculator
                    </Box>
                    <Box onClick={() => setCalcModalOpen(false)}><MdOutlineClose /></Box>
                </Box>
                <Box display={'flex'} justifyContent={'space-between'} fontSize={'18px'} mb={'5px'}>
                    <Box>
                        = {calcshowtype ? numberWithCommas((Number(calcamount) / tokenInfo?.price.price).toFixed(2))
                            : numberWithCommas(Number(tokenInfo?.price.price * Number(calcamount)).toFixed(2))} {calcshowtype ? 'SFINU' : 'USD'}
                    </Box>
                    <Box>
                        Balance : {calcshowtype ? numberWithCommas(Number(tokenInfo?.balance * tokenInfo?.price.price).toFixed(2)) :
                            numberWithCommas(Number(tokenInfo?.balance).toFixed(2))}
                    </Box>
                </Box>
                <CustomInput className="amountinput" type="number" value={calcamount.toString()}
                    endAdornment={
                        <InputAdornment position="start">
                            <Box display={'flex'} alignItems={'center'}>
                                <Box fontSize={'14px'} mr={'5px'}>{calcshowtype ? 'USD' : 'SFINU '}</Box>
                                <Box mr={'20px'} fontSize={'32px'} style={{ cursor: 'pointer' }} onClick={() => setCalcShowType(!calcshowtype)}>
                                    <CgArrowsExchangeAlt />
                                </Box>
                                <Box
                                    style={{ cursor: "pointer", background: "rgb(64 75 151)" }}
                                    color={"white"}
                                    padding={"10px"}
                                    borderRadius={"10px"}
                                    fontSize={"30px"}
                                    onClick={() => {
                                        setCalcAmount(calcshowtype ? tokenInfo?.balance * tokenInfo?.price.price :
                                            tokenInfo?.balance)
                                    }}
                                >
                                    MAX
                                </Box>
                            </Box>
                        </InputAdornment>
                    }
                    onKeyPress={(event: any) => {
                        if ((event?.key === '-' || event?.key === '+')) {
                            event.preventDefault();
                        }
                    }}
                    onChange={(event: any) => {
                        if (event.target.value / 1 < 0)
                            return;

                        setCalcAmount(inputNumberFormat(event.target.value));
                    }} />
                <Box mt={'40px'} fontSize={'18px'}>
                    STAKED FOR
                </Box>
                <DaySelectPanel>
                    <DaySelectCard active={stakeday === 1} onClick={() => setStakeDay(1)} width={'20%'}>1D</DaySelectCard>
                    <DaySelectCard active={stakeday === 7} onClick={() => setStakeDay(7)} width={'20%'}>7D</DaySelectCard>
                    <DaySelectCard active={stakeday === 30} onClick={() => setStakeDay(30)} width={'20%'}>30D</DaySelectCard>
                    <DaySelectCard active={stakeday === 365} onClick={() => setStakeDay(365)} width={'20%'}>1Y</DaySelectCard>
                    <DaySelectCard active={stakeday === 365 * 5} onClick={() => setStakeDay(365 * 5)} width={'20%'}>5Y</DaySelectCard>
                </DaySelectPanel>
                <Box mt={'40px'} fontSize={'18px'}>
                    COMPOUNDING EVERY
                </Box>
                <Box display={'flex'}>
                    <Checkbox checked={compoundcalc} onChange={() => {
                        if (compoundday === -1)
                            setCompoundDay(0);
                        if (compoundcalc)
                            setCompoundDay(-1);
                        setCompoundCalc(!compoundcalc)
                    }} />
                    <DaySelectPanel>
                        <DaySelectCard active={compoundday === 0} onClick={() => compoundcalc && setCompoundDay(0)} width={'25%'}>1D</DaySelectCard>
                        <DaySelectCard active={compoundday === 1} onClick={() => compoundcalc && setCompoundDay(1)} width={'25%'}>7D</DaySelectCard>
                        <DaySelectCard active={compoundday === 2} onClick={() => compoundcalc && setCompoundDay(2)} width={'25%'}>14D</DaySelectCard>
                        <DaySelectCard active={compoundday === 3} onClick={() => compoundcalc && setCompoundDay(3)} width={'25%'}>30D</DaySelectCard>
                    </DaySelectPanel>
                </Box>

                <Box borderRadius={'16px'} mt={'40px'} border={'1px solid black'} padding={'30px'} mx={'20px'} mb={'20px'}>
                    <Box fontSize={'18px'} >ROI AT CURRENT RATES</Box>
                    <Box fontSize={'28px'} mt={'10px'} fontWeight={'bold'}>${
                        numberWithCommas((calcshowtype ? Number(calcamount) * CalculateRate(calcmodal) :
                            Number(calcamount) * tokenInfo?.price.price * CalculateRate(calcmodal)).toFixed(2))}</Box>
                    <Box mt={'10px'} fontWeight={'bold'}> ~ {
                        calcshowtype ? (Number(calcamount) * CalculateRate(calcmodal) / tokenInfo?.price.price).toFixed(3) :
                            (Number(calcamount) * CalculateRate(calcmodal)).toFixed(3)} SFINU({(CalculateRate(calcmodal) * 100).toFixed(2)}%)</Box>
                </Box>

                <Box display={'flex'} justifyContent={'center'} padding={'10px 0'}>
                    <Box display={'flex'} alignItems={'center'} style={{ cursor: 'pointer' }} onClick={() => setShowCalcDetail(!showcalcdetail)}>
                        <Box mr={'20px'} fontSize={'21px'}>
                            {showcalcdetail ? 'Hide' : 'Details'}
                        </Box>
                        {showcalcdetail ? <BsChevronUp /> : <BsChevronDown />}
                    </Box>
                </Box>

                {showcalcdetail ? <Box px={'20px'} fontSize={'18px'} mt={'20px'}>
                    <Box display={'flex'} justifyContent={'space-between'}>
                        <Box>APR</Box>
                        <Box>{Number(pools[calcmodal]?.rate).toFixed(2)}%</Box>
                    </Box>
                    <Box display={'flex'} justifyContent={'space-between'} mt={'10px'}>
                        <Box>APY (1x daily compound)</Box>
                        <Box>{Number(pools[calcmodal]?.rate * pools[calcmodal]?.rate * compound[calcmodal][0]).toFixed(2)}%</Box>
                    </Box>
                    <Box fontSize={'16px'} my={'20px'}>
                        Calculated based on current rates.<br />
                        All figures are estimates provided for your convenience only, and by no means represent guaranteed returns.
                    </Box>
                </Box> : ''}
            </Modal>
            <Modal
                isOpen={modalopen}
                onRequestClose={() => {
                    setModalOpen(false);
                }}
                style={customStyles1}
                contentLabel="Example Modal"
            >
                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} borderBottom={'2px solid rgb(231, 227, 235)'} mb={'20px'} fontSize={'24px'} py={'20px'} >
                    <Box >
                        {modaldata.isStake ? 'Stake Tokens' : 'Withdraw Tokens'}
                    </Box>
                    <Box onClick={() => {
                        setModalOpen(false);
                    }} style={{ cursor: 'pointer' }}>
                        <MdOutlineClose />
                    </Box>
                </Box>
                <Box display={'flex'} justifyContent={'end'} fontSize={'18px'} mb={'5px'}>
                    {modaldata.isStake ? 'Balance' : 'Staked Amount'} : {modaldata.balance}
                </Box>
                <CustomInput className="amountinput" type="number" value={amount.toString()}
                    endAdornment={
                        <InputAdornment position="start">
                            <Box
                                style={{ cursor: "pointer", background: "rgb(64 75 151)" }}
                                color={"white"}
                                padding={"10px"}
                                borderRadius={"10px"}
                                fontSize={"30px"}
                                onClick={() => { setAmount(modaldata.balance.toString()) }}
                            >
                                MAX
                            </Box>
                        </InputAdornment>
                    }
                    onKeyPress={(event: any) => {
                        if ((event?.key === '-' || event?.key === '+')) {
                            event.preventDefault();
                        }
                    }}
                    onChange={(event: any) => {
                        if (event.target.value / 1 < 0 || event.target.value / 1 > modaldata.balance)
                            return;
                        setAmount(inputNumberFormat(event.target.value));
                    }} />

                <ModalActions>
                    <ModalButton onClick={() => {
                        setModalOpen(false);
                    }}>Cancel</ModalButton>
                    <ModalButton disabled={!modaldata.balance} onClick={() => onConfirm()}>Confirm</ModalButton>
                </ModalActions>
            </Modal>
            {
                pools.map((data: any, i: any) => {
                    return <>
                        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} fontWeight={'400'} padding={'16px 10px'} borderBottom={i < pools.length - 1 ? '1px solid #56ced7' : 'none'}>
                            <Box display={'flex'} alignItems={'center'} width={'120px'}>
                                <Box width={'45px'} height={'38px'}>
                                    <img src={'/logo.png'} width={'100%'} height={'100%'} />
                                </Box>
                                <Box fontSize={'9px'} ml={'10px'}>
                                    <Box fontSize={'12px'} color={'#fcb034'}>Earn SFINU</Box>
                                    <Box color={'#fcb034'}>Stake SFINU</Box>
                                    <Box color={'#56ced7'}>Refl. BNB</Box>
                                    {
                                        data.duration ?
                                            <Box color={'#404040'}>{i === 0 ? '' : 'Lock:'} {data.duration}</Box> :
                                            <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                    }
                                </Box>
                            </Box>
                            <Box fontSize={'9px'} width={'80px'}>
                                <Box fontSize={'9px'} color={'#fcb034'}>SFINU Earned</Box>
                                {data.pendingReward ?
                                    <Box fontSize={'12px'} color={'#404040'}>{numberWithCommas(Number(data.pendingReward).toFixed(5))}</Box> :
                                    <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                }
                                {
                                    !tokenToUSD(data.pendingReward, 2)?.includes('null') ?
                                        <Box fontSize={'9px'} color={'#56ced7'}>~{numberWithCommas(tokenToUSD(data.pendingReward, 2)?.toString())}USD</Box> :
                                        <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                }
                            </Box>
                            <APRPanel>
                                <Box fontSize={'9px'}>
                                    <Box fontSize={'9px'} color={'#56ced7'}>APR</Box>
                                    {
                                        data.rate ?
                                            <Box fontSize={'12px'} color={'#404040'} style={{ cursor: 'pointer' }} onClick={() => {
                                                setCalcModalOpen(true);
                                                setCalcModal(i);
                                            }}>{data.rate}%</Box>
                                            :
                                            <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                    }
                                </Box>
                                <Box color={'#fcb034'} fontSize={'18px'} style={{ cursor: 'pointer' }} onClick={() => {
                                    setCalcModalOpen(true);
                                    setCalcModal(i);
                                }}><AiOutlineCalculator /></Box>
                            </APRPanel>
                            <TotalStaked>
                                <Box fontSize={'9px'} color={'#56ced7'}>Total Staked</Box>
                                {data.totalStaked ?
                                    <Box fontSize={'11px'}>{data.totalStaked} SFINU</Box> :
                                    <Skeleton variant={'text'} width={'100px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                }
                            </TotalStaked>
                            <EndsIn >
                                <Box>
                                    <Box fontSize={'9px'} color={'#56ced7'}>Ends In</Box>
                                    {data.endsIn ?
                                        <Box mr={'10px'} fontSize={'11px'}>{data.endsIn} blocks</Box> :
                                        <Skeleton variant={'text'} width={'80px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                    }
                                </Box>
                                <Box color={'#fcb034'} mt={'10px'}><BsAlarm /></Box>
                            </EndsIn>
                            <DetailButton onClick={() => {
                                let temp = [...showdetail];
                                temp[i] = !temp[i];
                                setShowDetail(temp)
                            }}>
                                <Box display={'flex'} fontSize={'11px'} >
                                    <Box color={'#56ced7'}>
                                        Details
                                    </Box>
                                    <Box color={'#fcb034'} pt={'2px'} ml={'10px'}>
                                        <FaChevronDown />
                                    </Box>
                                </Box>
                            </DetailButton>
                        </Box>

                        <Detail active={showdetail[i]} borderBottom={i < pools.length - 1 && showdetail[i] ? '1px solid #56ced7' : 'none'}>
                            <Box padding={'15px 65px'} pr={'35px'} display={'flex'} justifyContent={'space-between'} alignItems={'center'} >
                                <Box width={'150px'}>
                                    <Box fontSize={'11px'} color={'#fcb034'}>
                                        Ends in: &nbsp;&nbsp;9,023,334 blocks
                                    </Box>
                                    <a href={'https://pancakeswap.finance/info/token/token/0x190984cB2E74332c2c9017f4998E382fc31DC2D5'} target={'_blank'}>
                                        <Box fontSize={'11px'} color={'#56ced7'} display={'flex'} style={{ cursor: 'pointer' }}>
                                            <Box>See Token Info</Box>
                                            <Box ml={'10px'}><RiShareBoxLine fontSize={'14px'} /></Box>
                                        </Box>
                                    </a>
                                    <a href={'https://shitfaceinu.com/'} target={'_blank'}>
                                        <Box fontSize={'11px'} color={'#56ced7'} display={'flex'} style={{ cursor: 'pointer' }}>
                                            <Box>View Website</Box>
                                            <Box ml={'10px'}><RiShareBoxLine fontSize={'14px'} /></Box>
                                        </Box>
                                    </a>
                                    <a href={'https://bscscan.com/token/0x190984cb2e74332c2c9017f4998e382fc31dc2d5'} target={'_blank'}>
                                        <Box fontSize={'11px'} color={'#56ced7'} display={'flex'} style={{ cursor: 'pointer' }}>
                                            <Box>View Contract</Box>
                                            <Box ml={'10px'}><RiShareBoxLine fontSize={'14px'} /></Box>
                                        </Box>
                                    </a>
                                    <Box fontSize={'11px'} color={'#56ced7'} display={'flex'} alignItems={'center'} style={{ cursor: 'pointer' }}>
                                        <Box>Add to Metamask</Box>
                                        <Box ml={'20px'} width={'19px'} height={'19px'}>
                                            <img src={'/images/pools/metamask.png'} width={'100%'} height={'100%'} />
                                        </Box>
                                    </Box>
                                    <Box mt={'10px'}>
                                        <YellowPanel>
                                            <Box fontSize={'11px'} width={'85px'} height={'22px'}>
                                                <Box mr={'3px'}><BiLockAlt fontSize={'14px'} /></Box>
                                                <Box>Lockup</Box>
                                            </Box>
                                        </YellowPanel>
                                    </Box>
                                </Box>
                                <Box display={'flex'} alignItems={'center'} justifyContent={'space-between'} maxWidth={'250px'} width={'100%'}>
                                    <Box fontWeight={'bold'} width={'120px'}>
                                        <Box fontSize={'10px'} color={'#fcb034'}>SFINU EARNED</Box>
                                        {data.pendingReward ?
                                            <Box fontSize={'14px'} color={'#404040'}>{numberWithCommas(Number(data.pendingReward).toFixed(5))}</Box> :
                                            <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                        {
                                            !tokenToUSD(data.pendingReward, 2)?.includes('null') ?
                                                <Box fontSize={'10px'} color={'#56ced7'} fontWeight={'400'}>~{numberWithCommas(tokenToUSD(data.pendingReward, 2)?.toString())}USD</Box> :
                                                <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                        <Box fontSize={'10px'} color={'#fcb034'} mt={'15px'}>BNB REFLECTED</Box>
                                        {data.pendingReflection ? <Box fontSize={'14px'} color={'#404040'}>{numberWithCommas(Number(data.pendingReflection).toFixed(5))}</Box> :
                                            <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />}
                                        {BNBToUSD(data.pendingReflection, 2)?.includes('null') ?
                                            <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} /> :
                                            <Box fontSize={'10px'} color={'#56ced7'} fontWeight={'400'}>~{numberWithCommas(BNBToUSD(data.pendingReflection, 2)?.toString())}USD</Box>
                                        }
                                    </Box>

                                    <Box>
                                        <Box>
                                            <YellowPanel disabled={pending[i] || !(Number(data.pendingReward))} onClick={() => onCompoundReward(i)}>
                                                <Box width={'79px'} height={'19px'} fontSize={'9px'}>
                                                    Compound
                                                </Box>
                                            </YellowPanel>
                                        </Box>
                                        {i === 0 || data?.userinfo?.available / 1 ?
                                            <Box>
                                                <YellowPanel disabled={pending[i] || !(Number(data.pendingReward))} onClick={() => onHarvestReward(i)}>
                                                    <Box width={'79px'} height={'19px'} fontSize={'9px'}>
                                                        Harvest
                                                    </Box>
                                                </YellowPanel>
                                            </Box> : ''
                                        }
                                        <Box mt={'15px'}>
                                            <YellowPanel onClick={() => onCompoundReflection(i)} disabled={pending[i] || !(Number(data.pendingReflection))}>
                                                <Box width={'79px'} height={'19px'} fontSize={'9px'}>
                                                    Compound
                                                </Box>
                                            </YellowPanel>
                                        </Box>
                                        <Box>
                                            <YellowPanel onClick={() => onHarvestReflection(i)} disabled={pending[i] || !(Number(data.pendingReflection))}>
                                                <Box width={'79px'} height={'19px'} fontSize={'9px'}>
                                                    Harvest
                                                </Box>
                                            </YellowPanel>
                                        </Box>
                                    </Box>
                                </Box>
                                <Box fontSize={'10px'} width={'100%'} maxWidth={'280px'}>
                                    <Box display={'flex'} justifyContent={'space-between'}>
                                        <Box color={'#56ced7'}>LOCK DURATION</Box>
                                        {
                                            data.duration ?
                                                <Box fontWeight={'bold'} color={'#404040'}>{data.duration}</Box> :
                                                <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                    </Box>
                                    <Box display={'flex'} justifyContent={'space-between'}>
                                        <Box color={'#56ced7'}>DEPOSIT FEE</Box>
                                        {
                                            data.depositFee ?
                                                <Box color={'#404040'} fontWeight={'bold'} >{Number(data.depositFee).toFixed(2)}%</Box> :
                                                <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                    </Box>
                                    <Box display={'flex'} justifyContent={'space-between'}>
                                        <Box color={'#56ced7'}>WITHDRAW FEE</Box>
                                        {
                                            data.withdrawFee ?
                                                <Box color={'#404040'} fontWeight={'bold'} >{Number(data.withdrawFee).toFixed(2)}%</Box> :
                                                <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                    </Box>
                                    <Box display={'flex'} justifyContent={'space-between'} fontSize={'10px'} mt={'10px'}>
                                        <Box>
                                            <Box color={'#fcb034'}>SFINU STAKED</Box>
                                            {
                                                data.allowance && Number(data.allowance) >= Math.pow(10, 28) && Number(data.stakingAmount) > 0 ?
                                                    <>
                                                        {
                                                            data.stakingAmount ?
                                                                <Box fontSize={'14px'} fontWeight={'700'} color={'#404040'}>{numberWithCommas(Number(data.stakingAmount).toFixed(5))}</Box> :
                                                                <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                                        }
                                                        {tokenToUSD(data.stakingAmount, 2)?.includes('null') ?
                                                            <Skeleton variant={'text'} width={'40px'} style={{ transform: 'unset', marginBottom: '3px' }} /> :
                                                            <Box color={'#56ced7'}>~{numberWithCommas(tokenToUSD(data.stakingAmount, 2))}USD</Box>
                                                        }
                                                    </> : ''
                                            }
                                        </Box>
                                        {Number(data.allowance) >= Math.pow(10, 28) && data.allowance &&
                                            Number(data.stakingAmount) > 0 ?
                                            <Box display={'flex'} mt={'10px'}>
                                                <StakeAction onClick={() => {
                                                    setModalOpen(true);
                                                    setModalData({
                                                        modallocknum: i, address: data.address, isStake: false, balance: Number(data.stakingAmount)
                                                    });
                                                }}>-</StakeAction>
                                                <Box mr={'5px'} />
                                                <StakeAction onClick={() => {
                                                    setModalOpen(true);
                                                    setModalData({
                                                        modallocknum: i, address: data.address, isStake: true, balance: Number(tokenInfo.balance)
                                                    })
                                                }}>+</StakeAction>
                                            </Box>
                                            : ''
                                        }
                                        {Number(data.allowance) < Math.pow(10, 28) || !data.allowance ?
                                            account ?
                                                <EnableButton onClick={() => onApproveContract(i, data.address)} disabled={pending[i]}>
                                                    <Box width={'100%'} height={'35px'} fontSize={'14px'}>
                                                        Enable
                                                    </Box>
                                                </EnableButton> :
                                                <EnableButton onClick={() => setOpen(true)}>
                                                    <Box width={'100%'} height={'35px'} fontSize={'14px'}>
                                                        Connect Wallet
                                                    </Box>
                                                </EnableButton>
                                            : ''
                                        }
                                    </Box>
                                    <Box fontSize={'10px'} mt={'10px'}>
                                        <Box color={'#fcb034'}>LOCKED</Box>
                                        {data.locked ?
                                            <Box color={'#404040'}  >{numberWithCommas(Number(data.locked).toFixed(0))}</Box> :
                                            <Skeleton variant={'text'} width={'60px'} style={{ transform: 'unset', marginBottom: '3px' }} />
                                        }
                                    </Box>
                                </Box>
                            </Box>
                            <Box
                                display={'flex'}
                                justifyContent={'center'}
                                width={'100%'}
                                bgcolor={'white'}
                                alignItems={'center'}
                                height={'40px'}
                                fontSize={'12px'}
                                color={'#404040'}
                                borderTop={'1px solid #56ced7'}
                                style={{ cursor: 'pointer' }}
                                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                            >
                                <Box>To Top</Box>
                                <Box ml={'10px'} mt={'5px'}><FaChevronUp /></Box>
                            </Box>
                        </Detail>
                    </>
                })
            }
        </PoolField>
    );
};

const PoolField = styled(Box)`
    border : 1px solid #56ced7;
    border-radius : 20px;
    overflow : hidden;
    margin-bottom : 20px;
`;

const Detail = styled(Box) <{ active: boolean }>`
    
    font-weight : 400;
                    background-color : #fff4e2;
    >div>div:nth-child(1)>div{
        margin-top : 8px;
    }
    transition : all 0.2s;
    overflow : hidden;
    height : ${({ active }) => active ? '210px' : '0'};
    @media screen and (max-width : 800px){
        >div:nth-child(1){
            flex-direction : column-reverse;
            padding : 15px 35px;
            >div{
                margin-bottom : 10px;
                width : 100%;
                max-width : 400px;
            }
        }
        height : ${({ active }) => active ? '525px' : '0'};
    }
`;

const YellowPanel = styled.button`
    color : white;
    border-radius : 30px;
    background-color : #fcb034;
    font-weight : 700;
    cursor : pointer;
    padding : 0;
    outline : none;
    border: none;
    >div{
        display : flex;
    justify-content : center;
    align-items : center;
    }
    :disabled{
        color : rgb(245,245,245);
        background-color : #ffb439b5;
        cursor : not-allowed;
    }
`;

const StakeAction = styled.button`
    width : 40px;
    height : 40px;
    border-radius : 10px;
    border : 2px solid #56ced7;
    display : flex;
    justify-content : center;
    align-items : center;
    font-weight : bold;
    background : transparent;
    font-size : 24px;
    color : #56ced7;
`;

const TotalStaked = styled(Box)`
    display : flex;
    justify-content : space-between;
    width : 100%;
    max-width : 150px;
    flex-direction : column;
    @media screen and (max-width : 700px){
        display : none;
    }
`;

const EndsIn = styled(Box)`
    @media screen and (max-width : 700px){
        display : none;
    }
    display : flex;
    justify-content : space-between;
    width : 100%;
    max-width : 130px;
    align-items : center;
`;

const DetailButton = styled(Box)`
    display : flex;
    justify-content : center;
    width : 100%;
    max-width : 100px;
    cursor : pointer;
    @media screen and (max-width : 700px){
        >div>div:nth-child(1){
            display : none;
        }
        max-width : 30px;
    }
`;

const APRPanel = styled(Box)`
    display : flex;
    align-items : center;
    width : 100%;
    max-width : 70px;
    justify-content : space-between;
    @media screen and (max-width : 700px){
        max-width : 20px;
        >div:nth-child(2){
            display : none;
        }
    }
`;


const EnableButton = styled.button`
    width : 100%;
    max-width : 150px;
    color : white;
    border-radius : 7px;
    background-color : #56ced7;
    font-weight : 700;
    cursor : pointer;
    padding : 0;
    outline : none;
    border: none;
    >div{
        display : flex;
    justify-content : center;
    align-items : center;
    }
    :disabled{
        color : rgb(245,245,245);
        background-color : rgb(86,206,215,0.7);
        cursor : not-allowed;
    }
`;

const ModalActions = styled(Box)`
    display : flex;
    justify-content : space-between;
    margin-top : 40px;
    @media screen and (max-width : 500px){
        flex-direction : column;
        >button{
            width : 100%;
        margin-bottom : 10px;
        }
    }
 `

const ModalButton = styled.button`
    text-align : center;
    border : 2px solid #56ced7;
    background : white;
    color : #56ced7;
    padding : 10px 70px;
    font-size : 21px;
    border-radius : 10px;
    cursor : pointer;
    transition : all 0.3s;
    :hover{
        background : #56ced7;
    color : white;
    }
    :disabled{
        background : rgb(233, 234, 235);
        color : rgb(189, 194, 196);
        cursor : not-allowed;
        border : none;
    }
}
    `
const CustomInput = styled(OutlinedInput)`
    font-size: 20px !important;
    width: 100%;
    border-radius: 10px!important;
    border : 1px solid rgb(64 75 151);
    color : black!important;
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
    -webkit-appearance: none; 
    }
    margin: 0; 
`;

const DaySelectPanel = styled(Box)`
    background-color: rgb(239, 244, 245);
    border-radius: 16px;
    display: inline-flex;
    border: 1px solid rgb(233, 234, 235);
    width : 100%;
    font-size : 21px;
>div{
        display : flex;
    justify-content : center;
    align-items : center;
    cursor : pointer;
    padding : 10px 0px;
}
    `;

const DaySelectCard = styled(Box) <{ active: boolean }>`
    background-color: ${({ active }) => active ? 'rgb(15, 33, 49)' : 'unset'};
    color: ${({ active }) => active ? 'white' : 'unset'};
    border-radius : 16px;
    transition : all 0.2s;
`;
export default RowPool;

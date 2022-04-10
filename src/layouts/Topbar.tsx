import React, { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Box } from "@material-ui/core";
import Web3 from "web3";
import { Link } from "react-router-dom";
import { AiFillFacebook } from 'react-icons/ai'
import { FaInstagram, FaYoutube, FaTwitter, FaPaperPlane } from 'react-icons/fa';
import { GiHamburgerMenu } from 'react-icons/gi'


declare let window: any;

interface TopbarProps {
    account: string;
    setAccount: any;
    open: any;
    setOpen: any;
}

const Topbar: React.FC<TopbarProps> = ({ account, setAccount, open, setOpen }) => {
    const [hamburgeropen, setHamburgerOpen] = useState(false);
    let ellipsis = account
        ? account.slice(0, 2) +
        "..." +
        account.substring(account.length - 4, account.length)
        : "Connect Wallet";

    const dialog = useRef<any>();
    const hamburger = useRef<any>();

    useEffect(() => {

        window.web3 = new Web3(new Web3.providers.HttpProvider('https://bsc-dataseed2.binance.org/'));
        document.addEventListener('mouseup', function (event) {
            if (dialog.current && !dialog.current.contains(event.target) && !hamburger.current.contains(event.target)) {
                setHamburgerOpen(false);
            }
        });
    }, []);

    useEffect(() => {
        console.log(hamburgeropen)
    }, [hamburgeropen])

    return (
        <StyledContainer >
            <Box display={'flex'} width={'100%'}>
                <Box display={'flex'} justifyContent={'center'} alignItems={'center'} width={'100%'}>
                    <Box display={'flex'} alignItems={'center'} justifyContent={'center'} width={'100%'}>
                        <Box width={'55px'} height={'47px'}>
                            <img src={'/logo.png'} width={'100%'} height={'100%'} alt={'logo'} />
                        </Box>
                        <LogoText><span>Shitface</span> Inu</LogoText>
                        <Divider ml={'15px'} />
                        <Menus>
                            <Box><Link to={'/'} style={{ color: 'white' }}>Tracker</Link></Box>
                            <Box><Link to={'/pools'} style={{ color: 'white' }}>Pools</Link></Box>
                            <Box>FAQ</Box>
                            <Box>Calculator</Box>
                            <Box>Official Website</Box>
                        </Menus>
                        <Divider />

                        <Socials mt={'6px'}>
                            <Box><AiFillFacebook /></Box>
                            <Box><FaInstagram /></Box>
                            <Box><FaYoutube /></Box>
                            <Box><FaTwitter /></Box>
                            <Box><FaPaperPlane /></Box>
                        </Socials>
                        <Divider />
                    </Box>
                </Box>
                <Box mr={'20px'} justifyContent={'end'}>
                    <Box display={'flex'} alignItems={'center'} height={'64px'} >
                        <Box width={'130px'}>
                            {
                                !account ?
                                    <ConnectButton onClick={() => setOpen(true)}>{ellipsis}</ConnectButton> :
                                    <ConnectedButton onClick={() => setAccount(null)}>
                                        <Box />
                                        {ellipsis}
                                    </ConnectedButton>
                            }
                        </Box>
                        <Hamburger onClick={() => setHamburgerOpen(!hamburgeropen)} ref={hamburger}>
                            <GiHamburgerMenu />
                        </Hamburger>
                    </Box>
                </Box>
            </Box>
            <div ref={dialog}>
                <HamburgerMenu width={'100%'} open={hamburgeropen}>
                    <Menus open={hamburgeropen}>
                        <Box><Link to={'/'} style={{ color: 'white' }}>Tracker</Link></Box>
                        <Box><Link to={'/pools'} style={{ color: 'white' }} >Pools</Link></Box>
                        <Box>FAQ</Box>
                        <Box>Calculator</Box>
                        <Box>Official Website</Box>
                    </Menus>

                    <Socials open={hamburgeropen}>
                        <Box><AiFillFacebook /></Box>
                        <Box><FaInstagram /></Box>
                        <Box><FaYoutube /></Box>
                        <Box><FaTwitter /></Box>
                        <Box><FaPaperPlane /></Box>
                    </Socials>
                </HamburgerMenu>
            </div>
        </StyledContainer >
    );
};
const StyledContainer = styled(Box)`
    width : 100%;
    background-color : #56ced7;
    @media screen and (max-width : 1175px){
        >div:nth-child(1)>div:nth-child(1)>div{
            justify-content : start;
            >div{
                width : fit-content;
                margin-left : 30px;
            }
        }
    }
    position : fixed;
    top : 0;
    z-index : 10;
`;

const LogoText = styled(Box)`
    font-family : none;
    font-size : 28px;
    font-weight : 400;
    color : #d3824a;
    font-style : italic;
    -webkit-text-stroke: 0.3px #363636;
    margin-left : 20px;
    >span{
        color : white;
    }
    @media screen and (max-width : 500px){
        display : none;
    }
`;

const Divider = styled(Box)`
    width : 2px;
    height : 34px;
    background-color :  rgba(255,255,255,0.3);
    @media screen and (max-width : 1175px){
        display : none;
    }
`;

const Menus = styled(Box) <{ open?: boolean }>`
    font-size : 12px;
    color : white;
    display : flex;
    justify-content : space-evenly;
    width : 100%;
    max-width : 500px;
    >div{
        cursor : pointer;
    }
    @media screen and (max-width : 1175px){
        display : ${({ open }) => open ? '' : 'none'};
        align-items : center;
        flex-direction : column;
        max-width : unset;
        font-size : 16px;
        >div{
            padding : 5px;
        }
    }
`;
const Socials = styled(Box) <{ open?: boolean }>`
    color : white;
    display : flex;
    justify-content : space-evenly;
    width : 100%;
    max-width : 180px;
    >div{
        cursor : pointer;
    }
    @media screen and (max-width : 1175px){
        display : ${({ open }) => open ? '' : 'none'};
        justify-content : center;
        max-width : unset;
        font-size : 24px;
        >div{
            padding : 10px 15px;
        }
    }
`;

const ConnectButton = styled(Box)`
    align-items: center;
    border-radius: 20px;
    width : 130px;
    height : 26px;
    box-shadow: rgb(14 14 44 / 40%) 0px -1px 0px 0px inset;
    cursor: pointer;
    display: inline-flex;
    font-family: inherit;
    font-size: 12px;
    font-weight: 600;
    justify-content: center;
    opacity: 1;
    height: 32px;
    background-color: rgb(31, 199, 212);
    color: white;
`;

const ConnectedButton = styled(Box)`
    width : 114px;
    height : 26px;
    display : flex;
    justify-content : center;
    align-items : center;
    background-color : white;
    color : #56ced7;
    border-radius : 20px;
    font-size : 11px;
    position : relative;
    overflow : unset;
    >div{
        position : absolute;
        border-radius : 50%;
        width : 29px;
        height : 29px;
        border: 1px solid #56ced7;
        top : -2px;
        left : -10px;
        background-color : white;
    }
    cursor : pointer;
`;

const Hamburger = styled.div`
    font-size : 24px;
    color : white;
    margin-top : 7px;
    margin-left : 20px;
    cursor : pointer;
    display : none;
    @media screen and (max-width : 1175px){
        display : unset;
    }
`;

const HamburgerMenu = styled(Box) <{ open: boolean }>`
    transition : all 0.3s;
    height : ${({ open }) => open ? '230px' : '0'};
    overflow : hidden;
    @media screen and (min-width : 1175px){
        display : none;
    }
`;
export default Topbar;

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Box } from '@material-ui/core';

import { Login, Config } from "./types";
import Web3 from 'web3';
import { connections, connectorLocalStorageKey } from "./entry";

declare let window: any;

interface Props {
    focus?: boolean;
    id: number;
    name: string;
    icon: any;
    setId: any;
    walletConfig: Config;
    login: Login;
    setOpen: () => void;
    account: any;
    setAccount: any;
}

const ConnectRow: React.FC<Props> = ({ login, walletConfig, focus, id, name, icon, setId, setOpen, account, setAccount }: any) => {
    const loadWeb3 = async () => {
        if (window.ethereum) {
            window.web3 = new Web3(window.ethereum);
            window.ethereum.enable();
        }
    }

    const onConnect = async () => {
        if (window.ethereum) {
            const chainId = await window.ethereum.request({ method: 'eth_chainId' });
            console.log(chainId / 1);
            if (chainId / 1 !== 56) {
                setAccount(null);
                const data = [{
                    chainId: '0x38',
                    chainName: 'BSC Mainnet',
                    nativeCurrency:
                    {
                        name: 'BNB',
                        symbol: 'BNB',
                        decimals: 18
                    },
                    rpcUrls: ['https://bsc-dataseed2.binance.org/'],
                    blockExplorerUrls: ['https://bscscan.com/'],
                }]
                try {
                    const tx = await window.ethereum.request({ method: 'wallet_addEthereumChain', params: data });
                }
                catch (error) {
                    console.log(error);
                }
            }
            else {
                try {
                    console.log("DDDD");
                    await window.ethereum.enable();
                    const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
                    console.log(accounts);
                    window.web3 = new Web3(window.ethereum);
                    setAccount(accounts[0]);
                } catch (error) {
                    console.log(error);
                }
            }
        }
    };
    const onConnectWallet = async () => {
        if (id === 0 || id === 3) {
            onConnect();
            setOpen(false);
        }
        else {
            login(connections[id].connectorId);
            window.localStorage.setItem(connectorLocalStorageKey, connections[id].connectorId);
            setOpen(false)
        }
    }

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on("accountsChanged", function (accounts: any) {
                console.log("AccountChanged");
                onConnect();
            });
            window.ethereum.on('networkChanged', function (networkId: any) {
                // Time to reload your interface with the new networkId
                onConnect();

            })
        }
    }, [window.ethereum])
    return (
        <StyledContainer
            borderRadius='15px'
            padding='10px'
            onClick={() => onConnectWallet()}
            display={'flex'}
            flexDirection={'column'}
            alignItems={'center'}
            justifyContent={'center'}
            height={'120px'}
            mr={'10px'}
            mt={'10px'}
        >
            <Box width='40px' height='40px' borderRadius='50%' display='flex' justifyContent='center' alignItems='center'>
                <img src={icon} alt='connection-icon' width={'100%'} height={'100%'} />
            </Box>
            <Box>
                <Box color={'black'} mt={'10px'}>{name}</Box>
            </Box>

        </StyledContainer>
    );
}

const StyledContainer = styled(Box)`
    cursor: pointer;
    transition : all 0.2s;
    width : 180px;
    @media screen and (max-width : 450px){
        width : 140px;
    }
    :hover{
        background-color : rgb(240,240,240);
    }
`;

const ConnectBall = styled(Box)`
    >div {
        transform: translate(-50%, -50%);
    }
`;

export default ConnectRow;
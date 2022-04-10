import Icon1 from '../../assets/images/connect/1.png'
import Icon2 from '../../assets/images/connect/2.svg'
import Icon3 from '../../assets/images/connect/binancechain.png'
import TrustWallet from '../../assets/images/connect/trustwallet.png'

import { Config, ConnectorNames } from "./types";

export const connections: Config[] = [
    {
        id: 0,
        name: 'Metamask',
        icon: Icon1,
        connectorId: ConnectorNames.Injected,
    },
    {
        id: 1,
        name: 'Wallet Connect',
        icon: Icon2,
        connectorId: ConnectorNames.WalletConnect,
    },
    {
        id: 2,
        name: "Binance Chain",
        icon: Icon3,
        connectorId: ConnectorNames.BSC,
    },
    {
        id: 3,
        name: "Trust Wallet",
        icon: TrustWallet,
        connectorId: ConnectorNames.Injected,
    },
];

export const connectorLocalStorageKey = "connectorId";
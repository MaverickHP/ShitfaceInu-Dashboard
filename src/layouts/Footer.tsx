import React from 'react'
import styled from 'styled-components'
import { Box } from '@material-ui/core'

const Footer: React.FC = () => {
    return (
        <StyledContainer fontSize={'13px'} color={'#303030'} position={'relative'}>
            <Box width={'100%'}>
                <Menus maxWidth={'300px'} mx={'auto'} display={'flex'} justifyContent={'space-between'} mt = {'calc(100vw / 1921 * 130)'}>
                    <Box>Calculator</Box>
                    <Box>Whitepaper</Box>
                    <Box>FAQs</Box>
                </Menus>
            </Box>
            <Box width={'100%'}>
                <Box textAlign={'center'} mt = {'calc(100vw / 1921 * 50)'}>
                    ShitFace Inu © Inu All rights reserved
                </Box>
            </Box>
        </StyledContainer>
    );
}

const StyledContainer = styled(Box)`
    background-image : url('/images/footer/Footer.png');
    background-size : 100% 100%;
    width : 100%;
    min-height : calc(100vw / 1921 * 229);
    height : fit-content;
    @media screen and (max-width : 500px){
        background-size : unset;
        background-position : center;
    }
`

const Menus = styled(Box)`
    @media screen and (max-width : 500px){
        flex-direction : column;
        align-items : center;
        max-width : unset;
        >div{
            margin-bottom : 10px;
        }
    }
`;
export default Footer;
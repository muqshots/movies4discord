import useSWR from "swr";
import Image from "next/image";
import XMR from "../../public/XMR.png";
import BTC from "../../public/BTC.png";
import ETH from "../../public/ETH.png";
import LTC from "../../public/LTC.png";

const Donate = () => {
    return (
        <div className="flex flex-col justify-center items-center overflow-hidden">
            <text className="text-center">
                We accept donations in the following ways:<br /><br />
                Paypal: <a className="text-blue-500" href="https://www.paypal.me/CristinaElen">https://www.paypal.me/CristinaElen</a><br />
                BTC (Bitcoin): bc1qgcj4xdkclsf2c95sp66caelrll85qsf6nt5hrh<br />
                ETH (Etherum): 0xb49F7C2fc50959c10535e92ec53B55A4d0021495<br />
                LTC (Litecoin): LhCuJW4uRaipTEeZuC5yg7HiDrNueCLmM9<br />
                XMR (Monero): Address too big, use QR code below. <br />
            </text>
            <div className="flex flex-col md:flex-row justify-center items-center m-10">
                <div className="flex flex-row md:flex-col justify-center items-center  m-5">
                    <Image src={BTC} width={215} height={215} alt="BTC"></Image>
                    <text className="m-5">
                    BTC (Bitcoin)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                    <Image src={XMR} width={215} height={215} alt="XMR"></Image>
                    <text className="m-5">
                    XMR (Monero)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                <Image src={ETH} width={215} height={215} alt="ETH"></Image>
                <text className="m-5">
                ETH (Etherum)
                </text>
                </div>
                <div className="flex flex-row md:flex-col justify-center items-center m-5">
                <Image src={LTC} width={215} height={215} alt="LTC"></Image>
                <text className="m-5">
                    LTC (Litecoin)
                </text>
                </div>
            </div>
        </div>
    )
}

export default Donate;
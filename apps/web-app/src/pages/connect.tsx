import useSWR from "swr";
import { useSession } from "next-auth/react";
import { fetcher } from "@/lib/fetcher";

const connect = () => {
    const { status } = useSession();
    const { data: pincodeJson } = useSWR(
        status === "authenticated" ? `/api/connect` : null,
        fetcher
    );
    const pincode = pincodeJson?.pincode
    return (
        <div className="flex flex-col justify-center items-center overflow-hidden">
            <text className="text-center">
                Use the following string of numbers to login on your TV app:<br></br>
                {pincode}
            </text>
        </div>
    )
}

export default connect;
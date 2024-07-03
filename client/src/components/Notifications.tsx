import axios from "axios";
import { useEffect, useState } from "react"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { UserPlus } from "lucide-react";
import { formatEmail } from "@/lib/utils";

const Notifications = ({ requests }: any) => {

  const [userDetails, setUserDetails] = useState<any>([]);
  const host = import.meta.env.VITE_SOME_HOST;
  useEffect(() => {
    requests.forEach((element: any) => {
      console.log(element.senderId)
      axios.post(`${host}/getUserById`, { userId: element.senderId })
        .then((res) => {
          let usr = res.data.user;
          setUserDetails([...userDetails, usr]);
        })
        .catch(err => console.log(err));
    });
  }, []);

  const handleAddFriend = (id: string) => {
    const token = localStorage.getItem("authToken");
    const headers = {
      "auth-token": token
    }
    axios.post(`${host}/addFriend`, { userId: id }, { headers: headers })
      .then((res) => {
        console.log(res.data.message);
        setUserDetails((prevUserDetails: any) =>
          prevUserDetails.filter((user: any) => user._id !== id)
        );
      })
      .catch(err => console.log(err));
  }

  return (
    <div>{
      userDetails.map((item: any, index: any) => {
        return (
          <div key={index}>
            <div
              className="flex w-full cursor-pointer pr-2 pl-2 hover:bg-c-bg dark:hover:bg-c-bg-1 h-16 items-center"
            >
              <img
                className="w-10 h-10 rounded-full"
                src={`http://localhost:5000/${item.logo}`}
                alt="logo"
              />
              <div className="flex justify-between h-16 w-full border-b-2 dark:border-r-slate-600">
                <div className="flex w-4/5 flex-col p-2 pb-0">
                  <p className="font-semibold">{item.username}</p>
                  <Tooltip>
                    <TooltipTrigger>
                      <p className="font-semibold">
                        {`${formatEmail(item.email)}...`}
                      </p>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>{item.email}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
                <div className="flex w-1/4 items-center h-16">
                  <Tooltip>
                    <TooltipTrigger>
                      <UserPlus onClick={() => handleAddFriend(item._id)} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Friend</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        )
      })
    }</div>
  )
}

export default Notifications
import { useState } from "react"
import { Input } from "./ui/input"
import { Search, UserPlus } from "lucide-react";
import axios from "axios";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const NewContact = ({ socket }: SidebarProps) => {

  const [searchText, setSearchText] = useState<string>("");
  const [err, setErr] = useState<Boolean>(false);
  const [user, setUser] = useState<any>({});

  const currentUser = useSelector((state: RootState) => state.user);

  const host = import.meta.env.VITE_SOME_HOST;

  const searchUser = async () => {
    const pattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const patRes = pattern.test(searchText);
    if (!patRes) {
      setErr(true);
      return;
    }
    try {
      const res = await axios.post(`${host}/findContact`, { email: searchText });
      if (res) {
        if (res.data.message === "No such user") {
          console.log(res.data.message);
        }
        else {
          setUser(res.data.message[0]);
        }
      }
    } catch (error) {
      console.log(err);
    }
  }

  const sendRequest = () => {
    socket?.send(JSON.stringify({
      type: "request",
      event: "proposal",
      senderId: currentUser._id,
      receiverId: user._id
    }))
  }

  return (
    <div>
      <div className={`border-b-2 p-3`}>
        <div className="flex items-center">
          <Input
            type="text"
            placeholder="Search for email of the user"
            value={searchText}
            onChange={(e) => {
              setErr(false);
              setSearchText(e.target.value);
            }}
            onFocus={() => setErr(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                searchUser();
              }
            }}
            className={`border-r-0 rounded-tr-none rounded-br-none ${err ? "border-t border-b border-l border-red-600" : ""}`}
          />
          <Search onClick={searchUser} className={`h-10 w-10 p-2 rounded-md border border-input rounded-tl-none rounded-bl-none border-l-0 bg-background cursor-pointer ${err ? "border-t border-b border-r border-red-600" : ""}`} />
        </div>
        {err &&
          <p className="text-xs text-red-600">
            Please enter a valid email
          </p>}
      </div>
      <div>
        {
          user.username !== undefined ?
            <div
              className="flex w-full cursor-pointer pr-2 pl-2 hover:bg-c-bg dark:hover:bg-c-bg-1 h-16 items-center"
            >
              <img
                className="w-10 h-10 rounded-full"
                src={`http://localhost:5000/${user.logo}`}
                alt="logo"
              />
              <div className="flex justify-between h-16 w-full border-b-2 dark:border-r-slate-600">
                <div className="flex flex-col p-2 pb-0">
                  <p className="font-semibold">{user.username}</p>
                  <p className="font-semibold">
                    {user.email}
                  </p>
                </div>
                <div className="flex items-center mr-4 h-16">
                  <Tooltip>
                    <TooltipTrigger>
                      <UserPlus onClick={sendRequest} />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Add Friend</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            </div>
            :
            "No user Found"
        }
      </div>
    </div>
  )
}

export default NewContact
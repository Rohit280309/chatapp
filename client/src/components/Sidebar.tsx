import { useDispatch, useSelector } from "react-redux"
import { ModeToggle } from "./mode-toggle"
import { Input } from "./ui/input"
import { ScrollArea } from "./ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { RootState } from "@/store"
import { setChat } from "@/state/chatState"
import { decryptMessage, formatDate, } from "@/lib/utils"
import { updateUnreadCount } from "@/state/contactsState"
import { useEffect, useState } from "react"
import NewContact from "./NewContact"
import { Bell, BellDot, MessageCirclePlus } from "lucide-react"
import { getRequest } from "@/lib/indexedDb"
import Notifications from "./Notifications"
import UpdateProfile from "./UpdateProfile"

const Sidebar = ({ socket }: SidebarProps) => {

  const coontacts = useSelector((state: RootState) => state.contact);
  const [searchText, setSearchText] = useState<string>("");
  const [searchContacts, setSearchContacts] = useState<any>([]);
  const [request, setRequest] = useState<any>([]);
  const [openNewChat, setOpenNewChat] = useState<Boolean>(false);
  const [openNotification, setOpenNotification] = useState<Boolean>(false);
  const [openEditProfile, setOpenEditProfile] = useState<Boolean>(false);

  const user = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch();

  const openChat = (item: any) => {
    dispatch(setChat(item));
    let payload = {
      _id: item._id,
      unRead: 0
    }
    dispatch(updateUnreadCount(payload));
  };

  useEffect(() => {
    if (searchText !== "") {
      let res = coontacts.filter((contact) => contact.username.includes(searchText));
      setSearchContacts(res)
    }
  }, [searchText]);

  useEffect(() => {
    const getNot = async () => {
      let reqs = await getRequest();
      setRequest(reqs);
    };

    getNot();

  }, [])


  return (
    <div className="h-screen overflow-hidden w-1/3 border-r-2 dark:border-r-slate-600">
      <div className="flex items-center justify-between bg-c-bg dark:bg-c-bg-1 h-16 border-b-2">
        <div className="w-1/2">
          <img
            onClick={() => setOpenEditProfile(!openEditProfile)}
            className="rounded-full w-10 h-10 ml-2 cursor-pointer"
            src={`http://localhost:5000/${user.logo}`}
            alt="icon"
          />
        </div>
        <div className="flex justify-end space-x-2 w-1/2">
          <Tooltip>
            <TooltipTrigger>
              <div onClick={() => setOpenNotification(!openNotification)} className="flex items-center justify-center cursor-pointer w-10 h-10 rounded-lg hover:bg-accent">
                {
                  request.length > 0 ?
                    <BellDot /> :
                    <Bell />
                }
              </div>
            </TooltipTrigger>
            <TooltipContent>Notifications</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger>
              <div onClick={() => setOpenNewChat(!openNewChat)} className="flex items-center justify-center cursor-pointer w-10 h-10 rounded-lg hover:bg-accent">
                {/* <img className="w-6 h-6" src="/assets/newchat.png" alt="chat" /> */}
                <MessageCirclePlus />
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>New Chat</p>
            </TooltipContent>
          </Tooltip>
          <div className="pr-2">
            <ModeToggle />
          </div>
        </div>
      </div>

      {
        openNewChat ?
          <NewContact socket={socket} /> :
          openNotification ?
            <Notifications requests={request} /> :
            openEditProfile ?
              <UpdateProfile /> :
              <>
                <div className="border-b-2 p-3 dark:border-r-slate-600">
                  <Input
                    type="text"
                    placeholder="Search"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                  />
                </div>
                <div>
                  <ScrollArea className="h-screen">
                    {
                      searchText === "" ?
                        coontacts.map((item, index) => (
                          <div key={index}>
                            <div

                              onClick={() => openChat(item)}
                              className="flex w-full cursor-pointer pr-2 pl-2 hover:bg-c-bg dark:hover:bg-c-bg-1 h-16 items-center"
                            >
                              <img
                                className="w-10 h-10 rounded-full"
                                src={`http://localhost:5000/${item.logo}`}
                                alt="logo"
                              />
                              <div className="flex h-16 w-full flex-col border-b-2 dark:border-r-slate-600">
                                <div className="flex p-2 pb-0 justify-between">
                                  <p className="font-semibold">{item.username}</p>
                                  <p className="font-semibold">
                                    {item.lastMessageDate !== undefined &&
                                      formatDate(item.lastMessageDate!)}
                                  </p>
                                </div>
                                <div className="flex p-2 pt-0 justify-between">
                                  {item.lastMessage === "Photo" ? (
                                    <p className="flex">
                                      <img src="/assets/cameraicon.png" alt="cam" />
                                      <span>Photo</span>
                                    </p>
                                  ) : item.lastMessage === "Video" ? (
                                    <p className="flex items-center">
                                      <img
                                        className="w-5 h-4"
                                        src="/assets/videoicon.png"
                                        alt="video"
                                      />
                                      <span>&nbsp;Video</span>
                                    </p>
                                  ) : (
                                    item.lastMessage !== undefined && (
                                      <p>{decryptMessage(item.lastMessage!)}</p>
                                    )
                                  )}
                                  {
                                    item.unRead! > 0 && (
                                      <p className="bg-green-500 w-10 rounded-lg flex justify-center items-center">
                                        {item.unRead! > 999 ? item.unRead! : item.unRead!}
                                      </p>
                                    )
                                  }
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                        :
                        searchContacts.length === 0 ?
                          <div className="flex justify-center border-b-2 dark:border-r-slate-600">
                            <h3 className="font-semibold text-md">No Results Found</h3>
                          </div>

                          :
                          searchContacts.map((item: any, index: any) => (
                            <div key={index}>
                              <div className="flex justify-center border-b-2 dark:border-r-slate-600">
                                <h3 className="font-semibold text-md">Search Results</h3>
                              </div>
                              <div
                                onClick={() => openChat(item)}
                                className="flex w-full cursor-pointer pr-2 pl-2 hover:bg-c-bg dark:hover:bg-c-bg-1 h-16 items-center"
                              >
                                <img
                                  className="w-10 h-10 rounded-full"
                                  src={`http://localhost:5000/${item.logo}`}
                                  alt="logo"
                                />
                                <div className="flex h-16 w-full flex-col border-b-2 dark:border-r-slate-600">
                                  <div className="flex p-2 pb-0 justify-between">
                                    <p className="font-semibold">{item.username}</p>
                                    <p className="font-semibold">
                                      {item.lastMessageDate !== undefined &&
                                        formatDate(item.lastMessageDate!)}
                                    </p>
                                  </div>
                                  <div className="flex p-2 pt-0 justify-between">
                                    {item.lastMessage === "Photo" ? (
                                      <p className="flex">
                                        <img src="/assets/cameraicon.png" alt="cam" />
                                        <span>Photo</span>
                                      </p>
                                    ) : item.lastMessage === "Video" ? (
                                      <p className="flex items-center">
                                        <img
                                          className="w-5 h-4"
                                          src="/assets/videoicon.png"
                                          alt="video"
                                        />
                                        <span>&nbsp;Video</span>
                                      </p>
                                    ) : (
                                      item.lastMessage !== undefined && (
                                        <p>{decryptMessage(item.lastMessage!)}</p>
                                      )
                                    )}
                                    {
                                      item.unRead! > 0 && (
                                        <p className="bg-green-500 w-10 rounded-lg flex justify-center items-center">
                                          {item.unRead! > 999 ? item.unRead! : item.unRead!}
                                        </p>
                                      )
                                    }
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                    }
                  </ScrollArea>
                </div>
              </>
      }

    </div>
  );
};

export default Sidebar
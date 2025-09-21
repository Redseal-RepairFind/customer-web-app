"use client";

import Modal from "@/components/ui/customModal";
import Text from "@/components/ui/text";
import Box from "../home/box";
import Image from "next/image";
import { icons, images } from "@/lib/constants";
import { Rating } from "@/components/ui/rating";
import { useState } from "react";
import { dummyCommHistory, messageTemplates } from "@/lib/dasboard-constatns";
import Button from "@/components/ui/custom-btn";
import { formatTo12Hour } from "@/lib/helpers";

const TechModal = ({
  tech,
  open,
  close,
}: {
  tech: any;
  open: boolean;
  close: () => void;
}) => {
  const [switched, setSwitched] = useState("Send Message");

  return (
    <Modal onClose={close} isOpen={open}>
      <div className="flex-cols gap-2">
        <Text.SmallHeading>Contact Technician</Text.SmallHeading>
        <Text.Paragraph className="text-dark-500 text-sm">
          Communicate with your assigned contractor about the ongoing job
        </Text.Paragraph>

        <Box px="px-2">
          <div className="flex flex-col gap-4 md:flex-row ">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <Image
                  src={images.technician}
                  height={24}
                  width={24}
                  className="rounded-full "
                  alt="Technician"
                />

                <span>
                  {"Jasper stark"} |{" "}
                  <span className="text-xs text-dark-500">job: #1234</span>
                </span>
              </div>

              <Text.SmallText className="text-dark-500 text-xs">
                Plumbing Specialist
              </Text.SmallText>

              <div className="flex items-center gap-2">
                <Rating defaultValue={5} disabled />
                <Text.Paragraph className="text-sm text-dark-400">
                  (156 Jobs)
                </Text.Paragraph>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Text.SmallHeading className="font-semibold text-sm">
                Appointment scheduled for Apr 15, 2025 at 2:00 PM - 4:00 PM
              </Text.SmallHeading>
              <Text.SmallText>Last updated: 15 minutes ago</Text.SmallText>
              <div className="flex items-center">
                <button className="mr-2 items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer">
                  <Image
                    src={icons.callIcon}
                    height={20}
                    width={20}
                    alt="Call icon"
                  />
                </button>
                <button className="items-center justify-center flex h-8 w-8 border border-light-0 rounded-sm cursor-pointer">
                  <Image
                    src={icons.chatIconActive2}
                    height={20}
                    width={20}
                    alt="Chat icon"
                  />
                </button>
              </div>
            </div>
          </div>
        </Box>

        <div className="border-t border-t-light-50 mt-4 py-2 flex-cols gap-2">
          <PageToggler
            setSwitched={setSwitched}
            switched={switched}
            btn1={"Send Message"}
            btn2="Communication History"
          />

          {switched.toLowerCase().includes("message") ? (
            <Messaging />
          ) : (
            <CommHistory />
          )}
        </div>
      </div>
    </Modal>
  );
};

export default TechModal;

const Messaging = () => {
  const [message, setMessage] = useState("");
  return (
    <>
      <Text.Paragraph className="font-[500] ">
        Quick Message Templates
      </Text.Paragraph>

      <div className="grid grid-cols-2 gap-4 my-2">
        {messageTemplates?.map((mes) => (
          <Box key={mes}>
            <button className="cursor-pointer" onClick={() => setMessage(mes)}>
              <Text.Paragraph className="text-sm text-start">
                {mes}
              </Text.Paragraph>
            </button>
          </Box>
        ))}
      </div>

      <Text.Paragraph className="font-[500] ">
        Send Custom Message
      </Text.Paragraph>

      <div className="input-container py-4">
        <textarea
          rows={4}
          cols={4}
          className="text-input"
          onChange={(e) => setMessage(e.target.value)}
          value={message}
        />
      </div>

      <Button className="mt-4">
        <div className="flex items-center gap-2">
          <Image src={icons.Vector} height={17} width={17} alt="message icon" />

          <Button.Text>Send Message</Button.Text>
        </div>
      </Button>
    </>
  );
};

const CommHistory = () => {
  return (
    <>
      <Text.Paragraph className="font-[500] ">
        Recent Communication{" "}
      </Text.Paragraph>

      <div className="flex-cols gap-4">
        {dummyCommHistory.map((dum, i) => (
          <CommItem key={i} item={dum as ComItemType} />
        ))}
      </div>
    </>
  );
};

type ComItemType = {
  type: "message" | "call";
  item: {
    initiator: string;
    message: string;
    createdAt: Date;
  };
};

type Item = {
  item: ComItemType;
};
const CommItem = ({ item }: Item) => {
  return (
    <div className="flex items-center justify-between border-b border-b-light-0 py-2">
      <div className="flex items-center gap-2">
        {item.type === "call" ? (
          <Image src={icons.callIcon} height={20} width={20} alt="Call icon" />
        ) : (
          <Image
            src={icons.chatIconActive2}
            height={20}
            width={20}
            alt="Chat icon"
          />
        )}
        <div className="flex-cols gap-2">
          <Text.Paragraph>{item?.item?.initiator}</Text.Paragraph>
          <Text.Paragraph className="text-dark-500">
            {item?.item.message}
          </Text.Paragraph>
        </div>
      </div>

      <Text.Paragraph className="text-dark-500">
        {formatTo12Hour(item?.item.createdAt)}
      </Text.Paragraph>
    </div>
  );
};

export const PageToggler = ({
  setSwitched,
  switched,
  btn1,
  btn2,
}: {
  setSwitched: any;
  switched: string;
  btn1: string;
  btn2: string;
}) => {
  return (
    <>
      <div className="relative w-full h-12 rounded-full bg-light-400 grid grid-cols-2 p-2 overflow-hidden">
        {/* Highlight Background */}
        <div
          className={`absolute left-2 right-2 top-2 h-8 w-[calc(50%-0.5rem)] rounded-full bg-white shadow-md transition-transform duration-300 ease-in-out ${
            switched === btn1 ? "translate-x-0" : "translate-x-full"
          }`}
        />

        {/* Buttons */}
        <button
          className={`relative z-10 transition-colors duration-300 ease-in-out ${
            switched === btn1 ? "text-black" : "text-dark-500"
          } cursor-pointer text-xs md:text-sm`}
          onClick={() => setSwitched(btn1)}
        >
          {btn1}
        </button>
        <button
          className={`relative z-10 transition-colors duration-300 ease-in-out ${
            switched === btn2 ? "text-black" : "text-dark-500"
          } cursor-pointer text-xs md:text-sm`}
          onClick={() => setSwitched(btn2)}
        >
          {btn2}
        </button>
      </div>

      {/* Content Switch with Fade Transition */}
      <div
        className="transition-opacity duration-300 ease-in-out"
        key={switched} // forces re-render on switch
      ></div>
    </>
  );
};

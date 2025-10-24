"use client";

import "react-time-picker/dist/TimePicker.css";
import "react-clock/dist/Clock.css";

import { InputContainer } from "@/components/auth/signup-item";
import Button from "@/components/ui/custom-btn";
import Dropdown from "@/components/ui/dropdown";
import PlacesAutocomplete from "@/components/ui/places-autocomplete";
import Text from "@/components/ui/text";
import ToggleBtn from "@/components/ui/toggle-btn";
import { useState } from "react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { usePricing } from "@/hook/usePricing";
import { LANG_ID, Subscription, SubscriptionResponse } from "@/utils/types";
import { useRepairs } from "@/hook/useRepairs";
import LoadingTemplate from "@/components/ui/spinner";
import { readCookie, readStringCookie } from "@/lib/helpers";
import { ClipLoader } from "react-spinners";
import Image from "next/image";
import { icons } from "@/lib/constants";
import toast from "react-hot-toast";
import { useSubCalc } from "@/hook/useSubCalc";

type SkilsTYpe = {
  name: string;
  distance: number | string;
  contractorCount: number;
}[];

const RequestModal = ({
  skillsList,
  subsList,
  closeModal,
}: {
  skillsList: SkilsTYpe;
  subsList: SubscriptionResponse;
  closeModal: () => void;
}) => {
  const [toggle, setToggle] = useState<boolean>(false);
  // const [dropdown, setDropdown] = useState<{
  //   name: string;
  //   distance: number | string;
  //   contractorCount: number;
  // }>();

  const [subs, setSubs] = useState<Subscription>();
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [time, setTime] = useState<Dayjs | null>(dayjs());
  const [open, setOpen] = useState({
    time: false,
    date: false,
  });
  const { daysLeft } = useSubCalc(subs);

  // const [serviceType, setServiceType] = useState<SkilsTYpe>(skillsList);
  const [message, setMessage] = useState("");
  const language = readStringCookie(LANG_ID);
  // const isWeekend = value ? value.day() === 0 || value.day() === 6 : false;

  // console.log(subs);

  const { creatingRequest, handleCreateRequest } = useRepairs();

  // console.log(subsList);

  // const shouldDisableTime = (
  //   value: Dayjs,
  //   view: "hours" | "minutes" | "seconds"
  // ) => {
  //   if (view !== "hours") return false;

  //   const hour = value.hour();

  //   //   if (isWeekend) {
  //   //     return hour < 14 || hour > 18; // only 2–6 PM
  //   //   } else {
  //   //     return hour < 9 || hour > 17; // only 9 AM–5 PM
  //   //   }
  // };

  // console.log(dropdown);
  return (
    <form className="w-full flex-cols gap-4 z-[1000]">
      <div className="flex-cols gap-2">
        <Text.SubHeading className="text-lg font-semibold">
          Confirm payment information for your Membership
        </Text.SubHeading>
        <Text.SmallText className="text-dark-500 text-sm">
          Fill out the form below to submit a new service request. We'll match
          you with qualified professionals in your area.
        </Text.SmallText>
      </div>
      {/* <div className="flex-col gap-4 mb-4">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Service type
          </Text.Paragraph>
        </div>
        <Dropdown className="w-full">
          <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
            <Text.Paragraph className="text-dark-500">
              {dropdown?.name || "Select Service type"}
            </Text.Paragraph>
          </Dropdown.Trigger>
          <Dropdown.Content className="w-full bg-white">
            <Dropdown.Label className="flex-cols gap-2">
              <Text.Paragraph className="text-dark-500 ">
                {"Select Service type"}
              </Text.Paragraph>

              <div className="input-container flex-rows items-center">
                <input
                  className="text-input"
                  placeholder="Search service type"
                  autoFocus
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase();
                    const filtered = skillsList.filter((item) =>
                      item.name.toLowerCase().includes(value)
                    );
                    setServiceType(filtered);
                  }}
                />
              </div>
            </Dropdown.Label>

            {serviceType?.length === 0 && (
              <Dropdown.Item className="p-4">
                <Text.Paragraph className="text-dark-500 ">
                  No service type found for the search inputs
                </Text.Paragraph>
              </Dropdown.Item>
            )}

            {serviceType?.map((eq, i) => (
              <Dropdown.Item
                key={eq.name}
                className={` border-b border-b-light-50`}
                onClick={() => setDropdown?.(eq)}
              >
                <Text.Paragraph className="text-dark-500">
                  {eq.name}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>
      </div> */}
      <div className="flex-col gap-4 mb-4">
        <div className="flex-rows mb-2">
          <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
            Select Plan
          </Text.Paragraph>
        </div>
        <Dropdown className="w-full">
          <Dropdown.Trigger className="w-full flex-row-between cursor-pointer">
            <Text.Paragraph className="text-dark-500 text-sm text-start">
              {subs
                ? `${subs.coverageAddress.address}  - ${subs.planName || ""}`
                : "Select Membership address"}
            </Text.Paragraph>
          </Dropdown.Trigger>
          <Dropdown.Content className="w-full bg-white">
            <Dropdown.Label className="flex-cols gap-2">
              <Text.Paragraph className="text-dark-500 ">
                {"Select Membership address"}
              </Text.Paragraph>
            </Dropdown.Label>

            {subsList?.data?.map((eq, i) => (
              <Dropdown.Item
                key={eq.id}
                className={` border-b border-b-light-50`}
                onClick={() => setSubs?.(eq)}
              >
                <Text.Paragraph className="text-dark-500 text-sm">
                  {`
                  ${eq.coverageAddress.address} - ${eq.planType || ""}
                 `}
                </Text.Paragraph>
              </Dropdown.Item>
            ))}
          </Dropdown.Content>
        </Dropdown>

        {(subs && subs.status !== "ACTIVE") || (subs && daysLeft > 0) ? (
          <div className="flex items-center gap-2 mt-4">
            <Image
              src={icons.disclaimer}
              height={20}
              width={20}
              alt="Disclaimer icon"
            />
            {daysLeft > 0 ? (
              <Text.Paragraph className="text-sm text-red-500">
                Note: The selected location is not eligible to make repair
                requests yet.
              </Text.Paragraph>
            ) : (
              <Text.Paragraph className="text-sm text-red-500">
                Note: the selected Membership is not active at the moment, You
                can not make repair requests to the selected location
              </Text.Paragraph>
            )}
          </div>
        ) : null}
      </div>
      <div className="flex-rows gap-2">
        <Text.Paragraph className="font-semibold">Emergency</Text.Paragraph>
        <ToggleBtn
          toggle={toggle}
          onClick={() => setToggle((tg) => !tg)}
          emergency
        />
      </div>
      <div className="flex-col gap-4 mb-4 w-full relative">
        <Text.Paragraph className="font-semibold">
          Plan Address{" "}
          <span className="text-xs text-dark-200">(Auto filled by plan)</span>{" "}
        </Text.Paragraph>
        <InputContainer>
          <input
            type="text"
            className="text-input"
            placeholder="The address associated to your selected plan"
            disabled
            value={subs ? `${subs?.coverageAddress?.address},` : ""}
          />
        </InputContainer>
      </div>

      <div className="grid-2">
        <div className="flex-col gap-4 mb-4">
          <div className="flex-rows mb-2">
            <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
              Prefered date
            </Text.Paragraph>
          </div>

          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select date"
              value={value}
              onChange={setValue}
              open={open.date}
              onClose={() =>
                setOpen((op) => ({
                  ...op,
                  date: false,
                }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  onClick: () =>
                    setOpen({
                      date: true,
                      time: false,
                    }),
                  InputProps: { sx: { color: "text.primary" } }, // black input text
                } as any,
                popper: { disablePortal: true }, // render inside dialog instead of body
              }}
            />
          </LocalizationProvider>
        </div>

        <div className="flex-col gap-4 mb-4">
          <div className="flex-rows mb-2">
            <Text.Paragraph className="font-semibold mr-2 text-sm lg:text-base text-dark-00">
              Prefered time
            </Text.Paragraph>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <TimePicker
              label="Select time"
              value={time}
              onChange={setTime}
              // ampm // 12-hour clock; remove for 24h
              // shouldDisableTime={shouldDisableTime}
              open={open.time}
              onClose={() =>
                setOpen((op) => ({
                  ...op,
                  time: false,
                }))
              }
              slotProps={{
                textField: {
                  fullWidth: true,
                  onClick: () =>
                    setOpen({
                      date: false,
                      time: true,
                    }),
                } as any,
                popper: { disablePortal: true }, // render inside dialog instead of body
              }}
            />
          </LocalizationProvider>
        </div>
      </div>
      <div className="flex flex-col">
        <Text.Paragraph className="font-semibold">
          How can we help you?
        </Text.Paragraph>
        <InputContainer>
          <textarea
            rows={4}
            cols={4}
            className="text-input py-2"
            onChange={(e) => setMessage(e.target.value)}
            value={message}
            placeholder="Describe the issue you want fixed"
          />
        </InputContainer>
      </div>
      <div className="flex-rows gap-2">
        <Button
          disabled={
            creatingRequest || subs?.status !== "ACTIVE" || daysLeft > 0
          }
          onClick={async () => {
            if (!subs?.coverageAddress?.address) {
              toast.error("Selected Membership have no coverage address");
              return;
            }
            const payload = {
              serviceType: "General Repairs",
              date: dayjs(value).format("YYYY-MM-DD"),
              time: dayjs(time).format("HH:mm"),
              description: message,
              language,
              subscriptionId: subs?.id,
              emergency: toggle,
            };

            // console.log(payload);

            await handleCreateRequest(payload, closeModal);
          }}
        >
          {creatingRequest ? (
            <Button.Icon>
              <ClipLoader size={20} color="#fff" />
            </Button.Icon>
          ) : null}
          <Button.Text>
            {creatingRequest ? "Submitting..." : "Submit Request"}
          </Button.Text>
        </Button>
        <Button
          variant="secondary"
          disabled={creatingRequest}
          onClick={closeModal}
        >
          <Button.Text>Cancel</Button.Text>
        </Button>
      </div>
    </form>
  );
};

export default RequestModal;

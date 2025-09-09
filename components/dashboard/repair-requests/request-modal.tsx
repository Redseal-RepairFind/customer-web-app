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

type SkilsTYpe = {
  name: string;
  distance: number | string;
  contractorCount: number;
}[];

const RequestModal = ({ skillsList }: { skillsList: SkilsTYpe }) => {
  const [toggle, setToggle] = useState<boolean>(false);
  const [dropdown, setDropdown] = useState<{
    name: string;
    distance: number | string;
    contractorCount: number;
  }>();
  const [value, setValue] = useState<Dayjs | null>(dayjs());
  const [time, setTime] = useState<Dayjs | null>(dayjs());
  const [open, setOpen] = useState({
    time: false,
    date: false,
  });

  const [serviceType, setServiceType] = useState<SkilsTYpe>(skillsList);
  const isWeekend = value ? value.day() === 0 || value.day() === 6 : false;

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

  return (
    <form action="" className="w-full flex-cols gap-4 z-[1000]">
      <div className="flex-cols gap-2">
        <Text.SubHeading className="text-lg font-semibold">
          Confirm payment information for your subscription
        </Text.SubHeading>
        <Text.SmallText className="text-dark-500 text-sm">
          Fill out the form below to submit a new service request. We'll match
          you with qualified professionals in your area.
        </Text.SmallText>
      </div>

      <div className="flex-col gap-4 mb-4">
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
        <Text.Paragraph className="font-semibold">Location</Text.Paragraph>
        <InputContainer>
          <input
            type="text"
            className="text-input"
            placeholder="e.g Kitchen, Bedroom, Living room"
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
            className="text-input"
            // onChange={(e) => setMessage(e.target.value)}
            // value={message}
          />
        </InputContainer>
      </div>
      <div className="flex-rows gap-2">
        <Button>
          <Button.Text>Submit Request</Button.Text>
        </Button>
        <Button variant="secondary">
          <Button.Text>Cancel</Button.Text>
        </Button>
      </div>
    </form>
  );
};

export default RequestModal;

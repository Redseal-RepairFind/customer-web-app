"use client";

import Text from "@/components/ui/text";
import { SpecialBox } from "../home/job-toast-modal";
import DashboardHeader from "../header";
import Button from "@/components/ui/custom-btn";
import Image from "next/image";
import { icons } from "@/lib/constants";
import { BranchCard } from "../home/multi-branch";

const Branches = () => {
  return (
    <main className="flex-cols gap-5">
      <DashboardHeader />

      <SpecialBox className="flex justify-around items-center border border-light-10">
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Total Locations
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">20</Text.Paragraph>
        </div>
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Active
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">12</Text.Paragraph>
        </div>
        <div className="flex-cols items-center gap-2 ">
          <Text.Paragraph className="text-dark-500 text-base">
            Inactive
          </Text.Paragraph>
          <Text.Paragraph className="font-bold text-base">8</Text.Paragraph>
        </div>
      </SpecialBox>

      <div className="flex-row-between">
        <Text.SmallHeading>Payment Methods</Text.SmallHeading>
        <Button variant="secondary">
          <Button.Text>Add new Card</Button.Text>
        </Button>
      </div>

      <PaymentMethodItem isDefault />

      <div className="grid-2">
        <BranchCard
          item={{
            country: "Canada",
            address: "Lafos ibadan expressway sulurele",
            status: "DISPUTE",
            plan: "Premium",
            eqAge: "1 - 4 years",
            expires: "20d",
          }}
          size="full"
        />
      </div>
    </main>
  );
};

export default Branches;

const PaymentMethodItem = ({ isDefault }: { isDefault: boolean }) => {
  return (
    <SpecialBox className="flex-cols border border-light-10 p-4">
      {isDefault ? (
        <div className="max-w-[200px]">
          <div className="px-4 py-2 bg-black text-light-main rounded-lg flex-row-center">
            <Text.Paragraph>Default</Text.Paragraph>
          </div>
        </div>
      ) : (
        <Button variant="secondary">
          <Button.Text>Set as default</Button.Text>
        </Button>
      )}

      <SpecialBox className="flex justify-between items-center border border-light-10 mt-4 p-3">
        <div className="flex-cols gap-2 p-2">
          <div className="flex items-start gap-2">
            <Image src={icons.card} height={20} width={20} alt="Card icon" />
            <div className="flex-col gap-2">
              <Text.Paragraph>**** **** **** 4242</Text.Paragraph>
              <Text.SmallText className="text-sm text-dark-500">
                Expires 12/27
              </Text.SmallText>
            </div>
          </div>
        </div>

        <button className="px-10 py-2 rounded-4xl border border-light-10 hover:bg-black hover:text-light-main transition-all duration-300 cursor-pointer">
          Edit
        </button>
      </SpecialBox>
    </SpecialBox>
  );
};

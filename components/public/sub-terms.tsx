"use client";

import React from "react";
import Text from "../ui/text";

export default function SubscriptionAgreementPage() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-10 space-y-8">
      <header className="space-y-2">
        <Text.Heading>RepairFind Subscription Agreement</Text.Heading>
        <Text.SubParagraph>
          Administered by: RepairFind Technologies Inc. (“RepairFind”)
        </Text.SubParagraph>
        <Text.SubParagraph>
          Contact:{" "}
          <Text.LinkText href="mailto:info@repairfind.ca" className="underline">
            info@repairfind.ca
          </Text.LinkText>{" "}
          |{" "}
          <Text.LinkText
            href="https://www.repairfind.ca"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold underline text-blue-500"
          >
            www.repairfind.ca
          </Text.LinkText>
        </Text.SubParagraph>
      </header>

      {/* 1. Agreement Structure & Nature of Services */}
      <section className="space-y-3">
        <Text.SmallHeading>
          1. Agreement Structure &amp; Nature of Services
        </Text.SmallHeading>
        <Text.Paragraph>
          This Repair Subscription Agreement (“Agreement”) is a binding contract
          between RepairFind Technologies Inc. (“RepairFind,” “we,” “us,” or
          “our”) and the subscribing entity (“Subscriber,” “you,” or “your”).
        </Text.Paragraph>
        <Text.Paragraph>
          This Agreement provides subscription-based maintenance and repair
          services as described herein. This is a service contract only. It is
          not an insurance policy, warranty, or guarantee of uninterrupted
          operation or business continuity.
        </Text.Paragraph>
      </section>

      {/* 2. Key Definitions */}
      <section className="space-y-3">
        <Text.SmallHeading>2. Key Definitions</Text.SmallHeading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Text.SubParagraph>
              <strong>“Covered Equipment”</strong>: means the operational
              systems at the Premises specifically designated for coverage under
              this Plan: Electrical, Plumbing, and HVAC.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>“Premises”</strong>: means the single, fixed-location
              commercial kitchen, food-service or hospitality establishment
              address listed in the Subscription Application.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>“Annual Labour Credit”</strong>: Prepaid credit applicable
              solely to labour charges at the prevailing rate of $150.00/hour.
              Credits cannot be applied to parts, fees, or other charges, and
              hold no cash value.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>“Service Call”</strong>: means a dispatched visit by a
              RepairFind-authorized technician for equipment maintenance,
              diagnosis or repair of a single issue. Multiple issues may
              constitute multiple Service Calls.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>“Dashboard”</strong>: The RepairFind digital platform for
              service requests, maintenance scheduling, account management, and
              communications.
            </Text.SubParagraph>
          </li>
        </ul>
      </section>

      {/* 3. Subscription Tiers & Fees */}
      <section className="space-y-3">
        <Text.SmallHeading>3. Subscription Tiers &amp; Fees</Text.SmallHeading>
        <Text.SubParagraph>
          RepairFind offers multiple subscription tiers, each with a 12-month
          minimum term:
        </Text.SubParagraph>

        <div className="overflow-x-auto">
          <table className="w-full border border-gray-200 text-left text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="p-3 border-b">Tier</th>
                <th className="p-3 border-b">Monthly Fee</th>
                <th className="p-3 border-b">Annual Labour Credit</th>
                <th className="p-3 border-b">Response Time</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border-b">Compliance Core Plan</td>
                <td className="p-3 border-b">$139.99</td>
                <td className="p-3 border-b">$500</td>
                <td className="p-3 border-b">Next Business Day</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Cost Control Plan</td>
                <td className="p-3 border-b">$179.99</td>
                <td className="p-3 border-b">$1,000</td>
                <td className="p-3 border-b">Same Business Day</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Reliability Plan</td>
                <td className="p-3 border-b">$299.99</td>
                <td className="p-3 border-b">$1,800</td>
                <td className="p-3 border-b">Same Business Day</td>
              </tr>
              <tr>
                <td className="p-3 border-b">Continuity Plan</td>
                <td className="p-3 border-b">$399.99</td>
                <td className="p-3 border-b">$2,600</td>
                <td className="p-3 border-b">Same Business Day</td>
              </tr>
            </tbody>
          </table>
        </div>

        <Text.SubParagraph className="italic">
          Labour is billed at $150.00/hour against credits. Once credits are
          exhausted, the Subscriber pays 100% of labour at $150/hour. Credits
          are non-cash, non-transferable, and valid only at the specified
          location. Credits expire at the end of the 12-month Term and do not
          roll over.
        </Text.SubParagraph>

        <Text.SubParagraph>
          <strong>
            3.1. Compliance Core Plan Specific Inclusions &amp; Exclusions
          </strong>
        </Text.SubParagraph>
        <Text.SubParagraph>
          <em>Includes (Annual unless noted):</em> Heating/Cooling inspection of
          gas lines and burners for leaks; cleaning/servicing up to two (2)
          compressors and condenser coils; inspection of refrigeration door
          gaskets. Safety &amp; Compliance: electrical panel inspection;
          exit/emergency lighting compliance check; checking lighting fixtures;
          minor repairs and battery replacement as needed. Plumbing (on
          request): assessment for leaks under sinks/dishwashers; clearance and
          maintenance of drains.
        </Text.SubParagraph>
        <Text.SubParagraph>
          <em>Excludes:</em> Exhaust Fan/Motor service, Fan &amp; Vent Cleaning,
          Make-Up Air (MUA) service, Grease Trap pumping, Dishwasher descaling,
          and New Appliance Installation. All other listed features (Dashboard,
          Troubleshooting call, etc.) remain included as listed.
        </Text.SubParagraph>
      </section>

      {/* 4. Payment & Credit Application */}
      <section className="space-y-3">
        <Text.SmallHeading>
          4. Payment &amp; Credit Application
        </Text.SmallHeading>
        <Text.Paragraph>
          <strong>Monthly subscriptions:</strong> Credits accrue monthly and may
          carry forward within the Term but expire at the end of the year.
        </Text.Paragraph>
        <Text.Paragraph>
          <strong>Annual prepay:</strong> 11 months’ fees grant one free month.
          Full credit is available immediately. Once any credit is used, the
          plan is non-cancellable and non-refundable. Upon early cancellation,
          unused credits are forfeited.
        </Text.Paragraph>
      </section>

      {/* 5. Service Request & Eligibility */}
      <section className="space-y-3">
        <Text.SmallHeading>
          5. Service Request &amp; Eligibility
        </Text.SmallHeading>
        <Text.Paragraph>
          Service requests must be submitted via the RepairFind Dashboard.
        </Text.Paragraph>
        <Text.SubParagraph>
          <strong>Eligibility:</strong>
        </Text.SubParagraph>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Text.SubParagraph>
              Operate a fixed-location commercial kitchen, café, hotel or
              food-service establishment (“Premises”).
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Maintain equipment in safe, operable, code-compliant condition at
              commencement of coverage.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Designate primary utility systems (Electrical, Plumbing, or HVAC)
              for coverage in the Subscription Application.
            </Text.SubParagraph>
          </li>
        </ul>
        <Text.SubParagraph>
          <strong>Exclusions:</strong> residential properties;
          mobile/non-stationary units; systems under manufacturer warranty or
          other service agreements; properties with known pre-existing
          conditions or uncorrected code violations; shared/common systems in
          multi-tenant properties where the Subscriber is not sole
          owner/operator.
        </Text.SubParagraph>
        <Text.SubParagraph>
          <strong>Additional Features:</strong> One (1) complimentary project
          consultation and estimate for expansion/remodelling per Term.
        </Text.SubParagraph>
      </section>

      {/* 6. Single Location Restriction */}
      <section className="space-y-3">
        <Text.SmallHeading>6. Single Location Restriction</Text.SmallHeading>
        <Text.SubParagraph>
          The Subscription is valid only for the single physical address
          provided during registration and cannot be transferred, shared, or
          applied to any other address without RepairFind’s prior written
          consent.
        </Text.SubParagraph>
      </section>

      {/* 7. Service Request & Authorization Protocol */}
      <section className="space-y-3">
        <Text.SmallHeading>
          7. Service Request &amp; Authorization Protocol
        </Text.SmallHeading>
        <Text.SubParagraph>
          7.1. All service requests must be submitted exclusively through the
          mobile application or web portal; phone/email requests are not valid
          Service Calls.
        </Text.SubParagraph>
        <Text.SubParagraph>
          7.2. Any service/repair/modification by an unauthorized third party
          voids coverage for that issue and any related subsequent issues.
        </Text.SubParagraph>
        <Text.SubParagraph>
          7.3. Subscriber agrees to provide safe, unobstructed access to the
          Premises and Covered Equipment during normal business hours.
        </Text.SubParagraph>
      </section>

      {/* 8. Waiting Period & Initial Inspection */}
      <section className="space-y-3">
        <Text.SmallHeading>
          8. Waiting Period &amp; Initial Inspection
        </Text.SmallHeading>
        <Text.SubParagraph>
          8.1. A thirty (30) day Waiting Period commences on the Subscription
          Start Date. No standard Service Calls or maintenance schedule is
          covered during this period.
        </Text.SubParagraph>
        <Text.SubParagraph>
          8.2. RepairFind may conduct an initial inspection. Failure to provide
          access may result in termination of this Agreement.
        </Text.SubParagraph>
      </section>

      {/* 9. Exclusions */}
      <section className="space-y-3">
        <Text.SmallHeading>9. Exclusions</Text.SmallHeading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Text.SubParagraph>
              Damage from external events (e.g., fire, flood, lightning,
              windstorm, earthquake, acts of God, pests), accident, negligence,
              grease blockages, vandalism, improper cleaning, or theft.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Costs to bring equipment/premises into code compliance; upgrades,
              renovations, or alterations; specific excluded components (e.g.,
              heat exchangers, humidifiers, flue systems, cosmetic parts).
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Hazardous materials (mould, asbestos, lead, chemical
              contaminants); testing, remediation, or abatement excluded.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Business interruption, spoilage, lost profits, or consequential
              damages.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Parts, materials, filters, fluids, or customer-supplied items
              (prohibited).
            </Text.SubParagraph>
          </li>
        </ul>
        <Text.SubParagraph>
          9.2. <strong>Troubleshooting:</strong> limited to one (1) incident per
          subscription year, capped at one (1) hour of labour; excess is
          reclassified as a Repair and billed against Service Repair Credit.
        </Text.SubParagraph>
        <Text.SubParagraph>
          9.3. RepairFind may refuse service or charge full prevailing rates for
          frivolous/abusive requests or conditions not constituting a legitimate
          malfunction.
        </Text.SubParagraph>
      </section>

      {/* 10. Term, Renewal, & Termination */}
      <section className="space-y-3">
        <Text.SmallHeading>
          10. Term, Renewal, &amp; Termination
        </Text.SmallHeading>
        <Text.SubParagraph>
          10.1. Initial Term: twelve (12) months from the Activation Date.
        </Text.SubParagraph>
        <Text.SubParagraph>
          10.2. Renewal: Auto-renews for successive 12-month terms. RepairFind
          will provide email notice of renewal and any fee changes at least 30
          days prior. Subscriber may opt out via Dashboard or{" "}
          <Text.LinkText href="mailto:info@repairfind.ca">
            info@repairfind.ca
          </Text.LinkText>{" "}
          at least 15 days before renewal.
        </Text.SubParagraph>
        <Text.SubParagraph>
          10.3. Subscriber Cancellation: May cancel anytime in writing. If
          cancelled after the Waiting Period but during the initial Term,
          Subscriber is responsible for the full value of any Service Calls
          provided plus a pro-rated portion of remaining fees as an early
          termination charge, not to exceed 50% of the remaining contract value.
        </Text.SubParagraph>
        <Text.SubParagraph>
          10.4. Termination by RepairFind: We may terminate for non-payment,
          material breach, fraud/misrepresentation, or unsafe conditions; or
          without cause with sixty (60) days’ written notice.
        </Text.SubParagraph>
      </section>

      {/* 11. Service Guarantee */}
      <section className="space-y-3">
        <Text.SmallHeading>11. Service Guarantee</Text.SmallHeading>
        <Text.SubParagraph>
          RepairFind warrants workmanship on covered repairs for ninety (90)
          days from completion. Warranty covers labour only; parts are excluded
          and may be covered by manufacturer.
        </Text.SubParagraph>
      </section>

      {/* 12. Limitation of Liability */}
      <section className="space-y-3">
        <Text.SmallHeading>12. Limitation of Liability</Text.SmallHeading>
        <Text.SubParagraph>
          REPAIRFIND’S TOTAL, AGGREGATE LIABILITY ARISING FROM OR RELATED TO
          THIS AGREEMENT SHALL BE LIMITED TO THE TOTAL FEES PAID BY SUBSCRIBER
          IN THE SIX (6) MONTHS PRECEDING THE EVENT GIVING RISE TO THE CLAIM OR
          THE ANNUAL LABOUR CREDIT, WHICHEVER IS LESS. IN NO EVENT SHALL
          REPAIRFIND BE LIABLE FOR ANY INDIRECT, INCIDENTAL, CONSEQUENTIAL,
          SPECIAL, OR PUNITIVE DAMAGES, INCLUDING LOST PROFITS OR BUSINESS
          INTERRUPTION.
        </Text.SubParagraph>
      </section>

      {/* 13. Dispute Resolution & Governing Law */}
      <section className="space-y-3">
        <Text.SmallHeading>
          13. Dispute Resolution &amp; Governing Law
        </Text.SmallHeading>
        <Text.SubParagraph>
          13.1. <strong>Mandatory Arbitration:</strong> Disputes resolved by
          binding arbitration administered by ADRIC under its Canadian
          Commercial Arbitration Rules in the Canadian province where the
          Subscriber’s Premises are located.
        </Text.SubParagraph>
        <Text.SubParagraph>
          13.2. <strong>Class Action Waiver:</strong> Parties agree to arbitrate
          solely on an individual basis and waive class-wide, consolidated, or
          representative actions.
        </Text.SubParagraph>
        <Text.SubParagraph>
          13.3. <strong>Governing Law:</strong> Laws of the Province in which
          the Subscription is obtained, and the federal laws of Canada
          applicable therein.
        </Text.SubParagraph>
      </section>

      {/* 14. General Provisions */}
      <section className="space-y-3">
        <Text.SmallHeading>14. General Provisions</Text.SmallHeading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Text.SubParagraph>
              <strong>Entire Agreement:</strong> This document plus the executed
              Subscription Application constitute the entire agreement.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>Amendment:</strong> Effective only if in writing and
              signed by authorized representatives of both parties.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>Assignment:</strong> Subscriber may not assign without
              prior written consent of RepairFind.
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              <strong>Privacy:</strong> Subscriber data handled per RepairFind’s
              Privacy Policy:{" "}
              <Text.LinkText
                href="https://www.repairfind.ca/privacy"
                target="_blank"
                rel="noopener noreferrer"
              >
                www.repairfind.ca/privacy
              </Text.LinkText>
              .
            </Text.SubParagraph>
          </li>
        </ul>
      </section>

      {/* 15. Additional Services */}
      <section className="space-y-3">
        <Text.SmallHeading>15. Additional Services</Text.SmallHeading>
        <ul className="list-disc pl-6 space-y-2">
          <li>
            <Text.SubParagraph>
              Dishwasher Maintenance: $120 per service
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Grease Trap Check/Pumping: $250 per service
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Exhaust Fan &amp; Vent Cleaning and Degreasing:
              <br />• 4ft hood: $300
              <br />• 8ft hood: $400
              <br />• 10ft hood: $500
              <br />• 12ft hood: $600
              <br />• 14ft hood: $800
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Compressor Maintenance: $150 per service
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              Make-Up Air (MUA) Unit Service: $250 per service
            </Text.SubParagraph>
          </li>
          <li>
            <Text.SubParagraph>
              New Appliance Installation (Labour Only, Parts Excluded): $200
            </Text.SubParagraph>
          </li>
        </ul>
        <Text.SubParagraph>
          RepairFind reserves the right to adjust these rates with thirty (30)
          days’ written notice to the Subscriber.
        </Text.SubParagraph>
      </section>

      {/* Acknowledgement */}
      <footer className="space-y-2">
        <Text.SmallHeading>Acknowledgement</Text.SmallHeading>
        <Text.SubParagraph>
          BY PROCEEDING WITH ACTIVATION, THE SUBSCRIBER ACKNOWLEDGES THAT THEY
          HAVE READ, UNDERSTOOD, AND AGREE TO BE BOUND BY ALL TERMS AND
          CONDITIONS OF THIS AGREEMENT, INCLUDING THE LIMITATION OF LIABILITY,
          ARBITRATION CLAUSE, AND CLASS ACTION WAIVER.
        </Text.SubParagraph>
      </footer>
    </section>
  );
}

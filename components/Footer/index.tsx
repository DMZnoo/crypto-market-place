import { useApp } from '@/contexts/AppProvider'
import { Discord, Document, Twitter } from '@/libs/icons/src/lib/icons'
import themes from '@/styles/globals.json'
import { Dialog, Transition } from '@headlessui/react'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, useEffect, useState } from 'react'
import Button from '../common/Button'

const Footer = () => {
  const { termsAccepted, setTermsAccepted } = useApp()
  const [showTerms, setShowTerms] = useState<boolean>(false)
  const [termsTicked, setTermsTicked] = useState<boolean>(false)

  useEffect(() => {
    setShowTerms(!termsAccepted)
  }, [termsAccepted])

  return (
    <footer className="flex items-start h-full justify-between mb-4">
      <div className="flex items-center">
        <Image
          src="/logo.svg"
          width={40}
          height={44}
          alt="logo"
          className="-ml-1"
        />
        <p className="text-sm 2xl:text-lg font-light">ION PROTOCOL</p>
      </div>
      <div className="flex items-center space-x-8 text-gray-500">
        {/* <p>Terms</p>
        <p>Cookies</p>
        <p>Privacy Policy</p> */}
        <Button variant="static-bare" onClick={() => setShowTerms(!showTerms)}>
          Terms
        </Button>
        <div className="flex space-x-3 scale-75 2xl:scale-100">
          <Link
            href="https://discord.com/invite/CjQqUgPA6Y"
            target="_blank"
            rel="noopener"
          >
            <Discord width={36} height={36} />
          </Link>
          <Link
            href="https://twitter.com/ionprotocol"
            target="_blank"
            rel="noopener"
          >
            <Twitter width={36} height={36} />
          </Link>
        </div>
      </div>
      <Transition.Root show={showTerms} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-[100]"
          // initialFocus={cancelButtonRef}
          onClose={() => {}}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-700"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
          </Transition.Child>
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-700"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel>
                  <div className="flex items-center justify-center">
                    <div className="w-full max-w-xl h-auto relative bg-white dark:bg-dark-primary-900 rounded-2xl p-6 overflow-hidden">
                      <div className="flex flex-col items-center mb-4">
                        <div className="bg-primary-400 rounded-[100%] bg-opacity-[10%] p-2 mb-1">
                          <div className="bg-primary-400 rounded-[100%] bg-opacity-[30%] p-3">
                            <Document fill={themes.colors.primary['700']} />
                          </div>
                        </div>

                        <p className="text-center text-2xl font-normal leading-10">
                          Terms & Conditions
                        </p>
                        <p className="mt-4 text-start px-2 text-gray-400 overflow-y-scroll max-h-80">
                          The website located at https://ionprotocol.io/ is
                          published, owned, and operated by Ion Protocol, Inc.
                          its Affiliates, and related entities (“Company”).
                          These Terms of Use (the “Terms,” or “Agreement”)
                          govern the user’s (“User”) access to and use of the
                          Platform’s (as defined below) front-end, whether
                          accessed via computer, mobile device, or otherwise
                          (individually and collectively, the “Website,”) as
                          well as any products and services provided by Company
                          (the “Ion Services”) (the Website, together with the
                          Ion Services, collectively referred to as the
                          “Service”). ACCEPTANCE OF AGREEMENT THESE TERMS SET
                          FORTH THE LEGALLY BINDING TERMS AND CONDITIONS THAT
                          GOVERN USER’S USE OF THE SERVICE AND ALL RELATED
                          TOOLS, MOBILE APPLICATIONS, WEB APPLICATIONS,
                          DECENTRALIZED APPLICATIONS, SMART CONTRACTS, AND
                          APPLICATION PROGRAMMING INTERFACES (“APIS”) LOCATED AT
                          ANY COMPANY WEBSITE INCLUDING WITHOUT LIMITATION,
                          SUCCESSOR WEBSITE(S) OR APPLICATION(S) THERETO
                          (COLLECTIVELY, THE “PLATFORM”). THESE TERMS SET OUT
                          USER’S RIGHTS AND RESPONSIBILITIES WITH RESPECT TO
                          USER’S USE OF THE PLATFORM FOR ANY PURPOSE, INCLUDING
                          BUT NOT LIMITED TO DEPOSITING VARIOUS DIGITAL ASSETS
                          AS COLLATERAL, SUCH AS LSTS, LP POSITIONS, AND INDEX
                          PRODUCTS, INTO THE PLATFORM’S SMART CONTRACTS,
                          ENABLING THEM TO BORROW ETH FOR DEFI ACTIVITIES OR
                          YIELD COMPOUNDING. BY USING THE SERVICE OR ACCESSING
                          THE PLATFORM IN ANY MANNER, USER ACCEPTS AND AGREES TO
                          BE BOUND AND ABIDE BY THESE TERMS AND ALL OF THE TERMS
                          INCORPORATED HEREIN BY REFERENCE. BY AGREEING TO THESE
                          TERMS, USER HEREBY CERTIFIES THAT USER IS AT LEAST 18
                          YEARS OF AGE. IF USER DOES NOT AGREE TO THESE TERMS,
                          USER MAY NOT ACCESS OR USE THE WEBSITE OR THE
                          PLATFORM. PLEASE BE AWARE THAT THESE TERMS REQUIRE THE
                          USE OF ARBITRATION (SECTION 14.5) ON AN INDIVIDUAL
                          BASIS TO RESOLVE DISPUTES, RATHER THAN JURY TRIALS OR
                          CLASS ACTIONS, AND LIMIT THE REMEDIES AVAILABLE TO
                          USER IN THE EVENT OF A DISPUTE. By accessing,
                          browsing, submitting information to, and/or using the
                          Platform, User accepts and agrees to be bound and
                          abide by these Terms and Company’s Privacy Policy,
                          incorporated herein by reference, and to comply with
                          all applicable laws, including, without limitation,
                          all federal, state and local tax and tariff laws,
                          regulations, and/or directives. Accordingly, under
                          Article 6 of the General Data Protection Regulation,
                          or “GDPR,” Users in the European Union acknowledge and
                          consent to Company’s processing of personal data as
                          necessary for the performance of these Terms, any
                          applicable agreements, and use of the Website. If User
                          does not agree to the Terms, please do not use the
                          Platform. AMENDMENTS Company reserves the right to
                          amend this Agreement and/or Company’s Privacy Policy
                          described in Section 4 below, at any time with or
                          without notice, as determined by Company in its sole
                          discretion. Company will post any amendment on the
                          Website. User should check this Agreement and
                          Company’s Privacy Policy regularly for updates. By
                          continuing to use the Platform, the Website, or the
                          Service after such amendment is made, User accepts and
                          agrees to such amendment. If User does not agree to
                          any amendment to any of these agreements, User must
                          stop using the Platform, the Website, and the Service.
                          If User has any questions about the terms and
                          conditions in this Agreement or Company’s Privacy
                          Policy, please contact Company at
                          support@ionprotocol.io. DEFINITIONS AND INTERPRETATION
                          Defined Terms. Capitalized terms not otherwise defined
                          in these Terms will have the following meanings:
                          “Affiliate” means, with respect to a party, any
                          person, firm, corporation, partnership (including,
                          without limitation, general partnerships, limited
                          partnerships, and limited liability partnerships),
                          limited liability company, or other entity that now or
                          in the future, directly controls, is controlled with
                          or by or is under common control with such party.
                          “Applicable Law” means all laws, statutes, rules,
                          regulations, ordinances, and other pronouncements
                          having the effect of law of any Governmental
                          Authority, including the Republic of Panama.
                          “Blockchain” generally means a peer-to-peer
                          distributed and public immutable ledger that maintains
                          a record of all transactions occurring on such ledger,
                          through a growing list of records (blocks) that are
                          securely linked together via cryptographic hashes.
                          Each block contains a cryptographic hash of the
                          previous block, a timestamp, and transaction data.
                          “Business Day” means any day (other than a Saturday,
                          Sunday, or legal holiday) on which financial
                          institutions in the Commonwealth of Virginia are
                          authorized or obligated to close. “Ion Ecosystem”
                          means all the projects and functionalities listed at
                          https://ionprotocol.io/ including without limitation
                          any transactions, communications, and collaborations
                          with other established projects. “Governmental
                          Authority” means any court, tribunal, arbitrator,
                          authority, agency, commission, official, or other
                          instrumentality of the United States or any state,
                          county, city, or other political subdivision or
                          similar governing entity. “Smart Contract” means a
                          program hosted on a Blockchain, consisting of code
                          specifying predetermined conditions that, when met,
                          trigger self-executing outcomes. “Wallet” means a
                          secure digital wallet, created through a combination
                          of private and public cryptographic keys, that enables
                          users to interact with, and transact on, blockchain
                          networks including but not limited to
                          cryptographically signing smart contracts, and
                          sending, receiving, and monitoring cryptocurrencies
                          and other digital tokens. PRIVACY By using the
                          Platform, Website, or Service, User agrees to, and is
                          bound by, the terms of Company’s Privacy Policy, which
                          is incorporated by reference into this Agreement as if
                          it were set forth herein in its entirety. The Privacy
                          Policy describes how Company collects, uses, and
                          discloses information provided by User. COMMUNICATION
                          WITH USERS User affirms that it is aware of and
                          acknowledges that Company is a Blockchain service
                          provider and has designed the Platform to be directly
                          accessible by Users without any involvement or actions
                          taken by Company or any third-party. THIRD-PARTY
                          LINKS, PRODUCTS, AND APPLICATIONS Third-party Sites.
                          The Website may contain links to websites controlled
                          or operated by persons and companies other than
                          Company (“Linked Sites”), including but not limited to
                          any sites related to digital transactions occasionally
                          hyperlinked, such as Discord, Dune Analytics, X
                          (Twitter), and websites referencing or supporting
                          Blockchain Technology projects, marketplaces, and
                          trading platforms. Linked Sites are not under the
                          control of Company, and Company is not responsible for
                          the contents of any Linked Site, including without
                          limitation any link contained on a Linked Site, or any
                          changes or updates to a Linked Site. Company is not
                          responsible if the Linked Site is not working
                          correctly or for any viruses, malware, or other harms
                          resulting from User’s use of a Linked Site. Company is
                          providing these links to User only as a convenience,
                          and the inclusion of any link does not imply
                          endorsement by Company of the site or any association
                          with its operators. User is responsible for viewing
                          and abiding by the privacy policies and terms of use
                          posted on the Linked Sites. User is solely responsible
                          for any dealings with third parties who support
                          Company or are identified on the Website, including
                          any delivery of and payment for goods and services.
                          Company does not store any information shared with a
                          Linked Site and is not responsible for any personally
                          identifiable information shared with any Linked Site.
                          Third-Party Smart Contracts. User acknowledges and
                          understands that Company uses certain third-party
                          Smart Contracts that it has no ownership of, or
                          control over, which are core components of the
                          Platform. Company is not responsible for any coding
                          errors, glitches, or any functionality, or lack
                          thereof, of such third-party Smart Contracts. Release.
                          To the fullest extent permitted by law, User hereby
                          releases and forever discharges Company (and its
                          Affiliates, officers, employees, agents, successors,
                          and assigns) from, and hereby waives and relinquishes,
                          each and every past, present, and future dispute,
                          claim, controversy, demand, right, obligation,
                          liability, action and cause of action of every kind
                          and nature (including personal injuries, death, and
                          property damage), that has arisen or arises directly
                          or indirectly out of, or that relates directly or
                          indirectly to, the Platform (including any
                          interactions with, or act or omission of, Company’s
                          partners or any other third-party or any Linked
                          Sites). IF USER IS A CALIFORNIA RESIDENT, USER HEREBY
                          WAIVES CALIFORNIA CIVIL CODE SECTION 1542 IN
                          CONNECTION WITH THE FOREGOING, WHICH STATES: “A
                          GENERAL RELEASE DOES NOT EXTEND TO CLAIMS WHICH THE
                          CREDITOR DOES NOT KNOW OR SUSPECT TO EXIST IN HIS OR
                          HER FAVOR AT THE TIME OF EXECUTING THE RELEASE, WHICH
                          IF KNOWN BY HIM OR HER MUST HAVE MATERIALLY AFFECTED
                          HIS OR HER SETTLEMENT WITH THE DEBTOR.” THE PLATFORM
                          Purpose of the Platform and Website. The Platform is a
                          fully decentralized liquidity lending protocol. The
                          Platform allows Users to borrow assets from the
                          Platform by using validator-backed assets as
                          collateral without requiring Users to sacrifice the
                          staking yield being accrued to those validator-backed
                          assets. Similarly, the Platform will provide liquidity
                          to Users who deposit their liquid re-staking tokens
                          into the Platform while retaining their exposure to
                          diverse sets of staking yield originating from
                          actively validated services. The Website is provided
                          for Users to access the Platform, use the Service, and
                          to provide updates about the Ion Ecosystem to Users.
                          Website Content. Company does not warrant the
                          accuracy, completeness, or usefulness of this
                          information at any particular time for any particular
                          purpose. Any reliance User places on such information
                          is strictly at User’s own risk. Company disclaims all
                          liability and responsibility arising from any reliance
                          placed on such content by User, or by anyone who may
                          be informed of any of its contents. Use of the
                          Website, Platform and Service; Licenses. Subject to
                          this Agreement, Company grants User a limited,
                          revocable, non-exclusive, non-transferable,
                          non-sublicensable license to access and use the
                          Platform, including the Website and the data,
                          material, content, or information herein
                          (collectively, the “Content”) solely for User’s
                          personal use. User’s right to access and use the same
                          shall be limited to the purposes described in these
                          Terms unless User is otherwise expressly authorized by
                          Company, in writing, to use the Platform for User’s
                          own commercial purposes. User agrees to use the
                          Platform only for lawful purposes, comply with all
                          rules governing any transactions on and through the
                          Platform and comply with the law. Any rights not
                          expressly granted herein are reserved, and no license
                          or right to use any trademark of Company or any
                          third-party is granted to User. Additional
                          Considerations Transactions Are Recorded on Public
                          Blockchains. The transactions that take place on the
                          Platform are managed and confirmed via public
                          Blockchains. User understands that its Wallet address
                          will be made publicly visible whenever it engages in a
                          transaction on the Platform. Company does not own or
                          control any Blockchain that Company chooses to
                          interface with, or any other third-party site,
                          product, or service that User might access, visit, or
                          use for the purpose of enabling User to access and
                          utilize the various features of the Platform. Company
                          is not liable for the acts or omissions of any such
                          third parties, and will not be liable for any damage
                          that a User may suffer as a result of its transactions
                          or any other interaction with any such third parties.
                          Gas. All transactions on the Platform are facilitated
                          by Smart Contracts. Public Blockchains require the
                          payment of a transaction fee (a “Gas Fee”) for every
                          transaction that occurs on its network, and thus every
                          transaction occurring on the Platform. The value of
                          the Gas Fee changes, often unpredictably, and is
                          entirely outside of the control of Company or the
                          Platform. User acknowledges that under no
                          circumstances will a transaction on the Platform be
                          invalidated, revocable, retractable, or otherwise
                          unenforceable on the basis that the Gas Fee for the
                          given transaction was unknown, too high, or otherwise
                          unacceptable to User. Prohibitions and Restrictions
                          Prohibited Uses. User agrees that it will not: Use the
                          Platform or the Service in any manner that could
                          damage, disable, overburden, or impair the Website or
                          the Platform or interfere with any other party’s use
                          and enjoyment of the same; Attempt to gain
                          unauthorized access to any website or platform,
                          computer systems, or networks associated with Company,
                          the Platform, or the Website; Obtain or attempt to
                          obtain any materials or information through the
                          Website by any means not intentionally made available
                          or provided by Company; Use any robot, spider, or
                          other automatic device, process or means to access the
                          Website for any purpose, including monitoring or
                          copying any of the material on the Website; Introduce
                          any viruses, Trojan horses, worms, logic bombs, or
                          other material which is malicious or technologically
                          harmful; Send unsolicited messages or use the Website
                          to send unsolicited messages such as spam; Perform any
                          benchmark tests or analyses related to the Website or
                          the Platform without express written permission of
                          Company; Send spam or engage in phishing. Spam is
                          unwanted or unsolicited bulk email, postings, contact
                          requests, or similar electronic communications.
                          Phishing is sending emails or other electronic
                          communications to fraudulently or unlawfully induce
                          recipients to reveal personal or sensitive
                          information, such as passwords, dates of birth, Social
                          Security numbers, passport numbers, credit card
                          information, financial information, or other sensitive
                          information, or to gain access to Wallets or records,
                          exfiltration of documents or other sensitive
                          information, payment and/or financial benefit; Attack
                          the Website or the Platform via a denial-of-service
                          attack or a distributed denial-of-service attack;
                          Impersonate or attempt to impersonate Company, a
                          Company employee, another User or any other person or
                          entity (including, without limitation, by using email
                          addresses associated with any of the foregoing);
                          License, sell, rent, lease, transfer, assign,
                          distribute, host, or otherwise commercially exploit
                          the Service, whether in whole or in part, or any
                          Content displayed on the Service except as permitted
                          herein; Modify, make derivative works of, disassemble,
                          reverse compile or reverse engineer any part of the
                          Service or the Platform; or Access the Platform in
                          order to build a similar or competitive website,
                          product, or service. Restrictions. Except as expressly
                          stated herein, no part of the Platform may be copied,
                          reproduced, distributed, republished, downloaded,
                          displayed, posted, or transmitted in any form or by
                          any means. Unless otherwise indicated, any future
                          release, update, or other addition to functionality of
                          the Platform will be subject to this Agreement. All
                          copyright and other proprietary notices related to the
                          Platform (including on any Content displayed on the
                          Website) must be retained on all copies thereof. User
                          will not use the Website or Platform for any illegal
                          purpose. Modification. Company reserves the right, at
                          any time, to modify, suspend, or discontinue the
                          Platform (in whole or in part) with or without notice
                          to Users. User agrees that Company will not be liable
                          to User or to any third-party for any modification,
                          suspension, or discontinuation of the Platform or any
                          part thereof. Affiliates. The rights, duties and/or
                          obligations of Company under this Agreement may be
                          exercised and/or performed by Company and/or any of
                          Company’s Affiliates, or any of their subcontractors
                          and/or agents. User agrees that any claim or action
                          arising out of or related to any act or omission of
                          any of Company or its Affiliates, or any of their
                          respective subcontractors or agents, related to the
                          subject matter hereof, shall only be brought against
                          Company, and not against any of Company’s Affiliates,
                          or any subcontractor or agent of Company or any its
                          Affiliates. INTELLECTUAL PROPERTY Company Intellectual
                          Property. The contents of the Platform, including the
                          Website, are intended for User’s personal,
                          noncommercial use. User acknowledges and agrees that
                          Company (or, as applicable, Company’s licensors) owns
                          all legal right, title, and interest in and to all
                          elements of the Platform, Company’s logo, graphics,
                          design, systems, methods, information, computer code,
                          software, services, “look and feel,” organization,
                          compilation of the content, code, data, and all other
                          elements of the Platform (collectively, the “Company
                          Materials”). The Website, Platform, Company Materials,
                          and Content are protected by copyrights, trademarks,
                          trade secrets, database rights, sui generis rights and
                          other intellectual or proprietary rights therein
                          pursuant to U.S. and international laws. Accordingly,
                          User is not permitted to use the Website or Content in
                          any manner, except as expressly permitted by Company
                          in these Terms. The Website or Content may not be
                          copied, reproduced, modified, published, uploaded,
                          posted, transmitted, performed, or distributed in any
                          way, and User agrees not to modify, rent, lease, loan,
                          sell, distribute, transmit, broadcast, or create
                          derivatives without the express written consent of
                          Company. Except as expressly set forth herein, User’s
                          use of the Platform does not grant User ownership of
                          or any other rights with respect to any Content, code,
                          data, or other materials that User may access on or
                          through the Platform. Company reserves all rights in
                          and to Company Materials not expressly granted to
                          Users in the Terms. User may not use any of Company’s
                          Content to link to the Website or Content without
                          Company’s express written consent. User may not use
                          framing techniques to enclose any such Content without
                          Company’s express written consent. In addition, the
                          “look and feel” of the Website and Content, including
                          without limitation, all page headers, custom graphics,
                          button icons, and scripts constitute the service mark,
                          trademark, or trade dress of Company and may not be
                          copied, imitated, or used, in whole or in part,
                          without Company’s prior written consent. Non-Company
                          Intellectual Property. Excluding Company Materials,
                          all other trademarks, product names, logos, and
                          similar intellectual property on the Platform are the
                          property of their respective owners and may not be
                          copied, imitated, or used, in whole or in part,
                          without the permission of the applicable owner.
                          Aggregate Data. Company shall have the right to
                          collect and analyze data and other information
                          relating to provision and use of various aspects of
                          the Platform. Company will be free to (i) use the data
                          to improve and enhance the Service and for other
                          development, diagnostic, and corrective purposes in
                          connection with the Platform and (ii) disclose data
                          solely in aggregate or other de-identified form in
                          connection with its business. DIGITAL MILLENNIUM
                          COPYRIGHT ACT COMPLIANCE Notification. Company takes
                          claims of copyright and/or trademark infringement
                          seriously. Company will respond to notices of alleged
                          copyright and/or trademark infringement that comply
                          with the law. If User believes any materials
                          accessible on or from the Website or Service infringes
                          its copyright, User may request removal of those
                          materials (or access to them) from the Website by
                          submitting written notification to Company’s copyright
                          agent (designated below). In accordance with the
                          Online Copyright Infringement Liability Limitation Act
                          of the Digital Millennium Copyright Act (17 U.S.C. §
                          512) (“DMCA”), the written notice (the “DMCA Notice”)
                          must include substantially the following: a physical
                          or electronic signature of a person authorized to act
                          on behalf of the owner of an exclusive right that is
                          allegedly infringed; identification of the copyrighted
                          work claimed to have been infringed, or, if multiple
                          copyrighted works on the Service are covered by a
                          single notification, a representative list of such
                          works from the Service; identification of the material
                          that is claimed to be infringing or to be the subject
                          of infringing activity and that is to be removed or
                          access to which is to be disabled, and information
                          reasonably sufficient to permit Company to locate the
                          material; information reasonably sufficient to permit
                          Company to contact the complaining party, such as an
                          address, telephone number, and, if available, an
                          electronic mail address at which the complaining party
                          may be contacted; a statement that the complaining
                          party has a good faith belief that use of the material
                          in the manner complained of is not authorized by the
                          copyright owner, its agent, or the law; a statement
                          that the information in the notification is accurate;
                          and under penalty of perjury, that the complaining
                          party is authorized to act on behalf of the owner of
                          an exclusive right that is allegedly infringed. If
                          User fails to comply with all of the requirements of
                          Section 512(c)(3) of the DMCA, its DMCA Notice may not
                          be effective. Upon removing any allegedly infringing
                          material, Company will notify the alleged infringer of
                          such takedown. Please note that under Section 512(f)
                          of the DMCA, any person who knowingly materially
                          misrepresents that material or activity is infringing
                          may be subject to liability. Counter Notification. If
                          User elects to send Company’s copyright agent a
                          counter notice, to be effective it must be a written
                          communication that includes the following (please
                          consult User’s legal counsel or see 17 U.S.C. Section
                          512(g)(3) to confirm these requirements): a physical
                          or electronic signature; identification of the
                          material that has been removed or to which access has
                          been disabled and the location at which the material
                          appeared before it was removed or access to it was
                          disabled; a statement under penalty of perjury that
                          the User has a good faith belief that the material was
                          removed or disabled as a result of mistake or
                          misidentification of the material to be removed or
                          disabled; adequate information by which Company can
                          contact User, including User’s name, address, and
                          telephone number; and a statement that the User
                          consents to the jurisdiction of a federal district
                          court for the judicial district in which the address
                          is located, or if the User’s address is outside of the
                          United States, for any judicial district in which
                          Company may be found, and that the User will accept
                          service of process from the person who provided
                          notification under subsection (c)(1)(C) or an agent of
                          such person. The DMCA allows Company to restore the
                          removed content if the party filing the original DMCA
                          Notice does not file a court action against User
                          within ten (10) Business Days of receiving the copy of
                          its counter notice. Please note that under Section
                          512(f) of the DMCA, any person who knowingly
                          materially misrepresents that material or activity was
                          removed or disabled by mistake or misidentification
                          may be subject to liability. Company’s designated
                          copyright agent or authorized official to receive
                          notifications and counter-notifications of claimed
                          infringement is: Ion Protocol, Inc. Email:
                          support@ionprotocol.io A summary of the DMCA can be
                          obtained from the U.S. Copyright Office.
                          INDEMNIFICATION User agrees to release, indemnify, and
                          hold harmless Company and its Affiliates, and their
                          respective officers, directors, employees and agents,
                          from and against any claims, liabilities, damages,
                          losses, and expenses, including, without limitation,
                          reasonable legal and accounting fees, arising out of
                          or in any way related to: (a) User’s access to, use
                          of, or inability to use the Platform, the Website, or
                          Service; (b) User’s breach of this Agreement; (c)
                          User’s violation of any rights of a third party; (d)
                          User’s violation of any Applicable Law; and (e) any
                          and all financial losses User may suffer, or cause
                          others to suffer, due to utilizing, transferring,
                          staking, or re-staking cryptocurrency, or any other
                          digital assets. ASSUMPTION OF RISK User Acknowledges
                          the Risk of Cryptocurrency and Smart Contracts. USER
                          REPRESENTS AND WARRANTS THAT IT UNDERSTANDS AND IS
                          WILLING TO ACCEPT THE RISKS ASSOCIATED WITH
                          CRYPTOGRAPHIC SYSTEMS SUCH AS SMART CONTRACTS, PUBLIC
                          BLOCKCHAINS (INCLUDING, BUT NOT LIMITED TO, THE
                          ETHEREUM BLOCKCHAIN), LIQUIDITY PROTOCOLS, AND THE
                          INTERPLANETARY FILE SYSTEM. Company is Not Responsible
                          for Technical Errors on Any Blockchain. COMPANY IS NOT
                          RESPONSIBLE FOR LOSSES ARISING FROM THE USE OF
                          BLOCKCHAINS OR ANY OTHER FEATURES OF ANY BLOCKCHAIN
                          NETWORK OR WALLET THAT COMPANY OR USER MAY INTERFACE
                          WITH, INCLUDING, BUT NOT LIMITED TO, LATE REPORT BY
                          DEVELOPERS OR REPRESENTATIVES (OR NO REPORT AT ALL) OF
                          ANY ISSUES WITH A BLOCKCHAIN NETWORK OR ANY ASSOCIATED
                          LAYER 2 BLOCKCHAINS THAT COMPANY OR USER MAY INTERFACE
                          WITH, INCLUDING FORKS, TECHNICAL NODE ISSUES, OR ANY
                          OTHER ISSUES RESULTING IN LOSS OF FUNDS. User
                          Acknowledges the Risks of Using its Staked and
                          Re-Staked Assets as Collateral. User acknowledges that
                          it will have to supply validator-backed assets as
                          collateral in order to borrow assets from the
                          Platform. By using the Services and the Platform, in
                          the event that the value of User’s liabilities exceeds
                          the value of the User’s collateral, User represents
                          and warrants that it understands that the Platform can
                          liquidate the digital assets which User provided as
                          collateral (a “Liquidation Event”). A Liquidation
                          Event will likely cause User to lose all the
                          collateral User provided to the Platform. User
                          acknowledges that the risk of a Liquidation Event is
                          inherent to the Platform and can happen at any time
                          given the volatility of digital assets. User further
                          acknowledges that Company and its Affiliates are not
                          responsible for any of these variables or risks,
                          cannot control the value of digital assets or User’s
                          collateral, and cannot be held liable for any
                          resulting losses that User experiences while accessing
                          or using the Platform. Accordingly, User understands
                          and agrees to assume full responsibility for all of
                          the risks of accessing and using the Platform and
                          interacting with the Platform. User Acknowledges the
                          Risks of the Platform. User acknowledges that the
                          Platform is subject to flaws and that User is solely
                          responsible for evaluating any information provided by
                          the Platform. This warning and others provided in this
                          Agreement by Company in no way evidence or represent
                          an ongoing duty to alert User to all of the potential
                          risks of utilizing or accessing the Platform. The
                          Platform may experience sophisticated cyber-attacks,
                          cryptocurrency based economic exploits, unexpected
                          surges in activity, or other operational or technical
                          difficulties that may cause interruptions to or delays
                          on the Platform. User agrees to accept the risk of the
                          Platform failure resulting from unanticipated or
                          heightened technical difficulties, including those
                          resulting from sophisticated attacks, and User agrees
                          that it will not hold Company accountable for any
                          related losses. Company will not bear any liability,
                          whatsoever, for any damage or interruptions caused by
                          any viruses that may affect User’s computer or other
                          equipment, or any phishing, spoofing or other attack.
                          Company Does Not Make Any Representations Regarding
                          the Value of Cryptocurrency or Other Digital Assets.
                          The prices of Blockchain assets are extremely
                          volatile. Fluctuations in the price of other digital
                          assets could materially and adversely affect the value
                          of cryptocurrency, which may also be subject to
                          significant price volatility. A lack of use or public
                          interest in the creation and development of
                          distributed ecosystems could negatively impact the
                          development, potential utility, or value of
                          cryptocurrency. The Ion Ecosystem and other digital
                          assets could be impacted by one or more regulatory
                          inquiries or regulatory actions. For all of the
                          foregoing reasons, as well as for reasons that may not
                          presently be known to Company, Company makes
                          absolutely no representations or warranties of any
                          kind regarding the value of cryptocurrency or other
                          digital assets. User Acknowledges Financial Risk of
                          Digital Assets. The risk of loss associated with the
                          use of digital assets can be substantial. User should,
                          therefore, carefully consider whether creating,
                          buying, selling, or otherwise using digital assets is
                          suitable for User in light of its circumstances and
                          financial resources. By using the Platform, accessing
                          the Website, and/or purchasing cryptocurrency, User
                          represents that it has been, is and will be solely
                          responsible for making its own independent appraisal
                          and investigations into the risks of a given
                          transaction and the underlying digital assets. User
                          represents that it has sufficient knowledge, market
                          sophistication, professional advice, and experience to
                          make its own evaluation of the merits and risks of any
                          transaction conducted via any digital asset. Under no
                          circumstances will the operation of all or any portion
                          of the Platform be deemed to create a relationship
                          that includes the provision or tendering of investment
                          advice. Company is Not Responsible for Losses Due to
                          Jurisdictional Blocks. User acknowledges that Company
                          has no control over jurisdictional blocks which may
                          prevent User from utilizing the Website. Under no
                          circumstances will Company be liable for User’s
                          inability to access the Website due to a
                          jurisdictional block. Violations by Other Users. User
                          irrevocably releases, acquits, and forever discharges
                          Company and its subsidiaries, Affiliates, officers,
                          and successors for and against any and all past or
                          future causes of action, suits, or controversies
                          arising out of another User’s violation of these
                          Terms. LIMITATION OF LIABILITY AND WARRANTY DISCLAIMER
                          Limitation of Liability. TO THE MAXIMUM EXTENT
                          PERMITTED BY LAW, IN NO EVENT WILL COMPANY (OR
                          COMPANY’S AFFILIATES) BE LIABLE TO USER OR ANY
                          THIRD-PARTY FOR ANY FINANCIAL LOSS, LOST PROFITS, LOST
                          DATA, COSTS OF PROCUREMENT OF SUBSTITUTE PRODUCTS, OR
                          ANY INDIRECT, CONSEQUENTIAL, EXEMPLARY, INCIDENTAL,
                          SPECIAL OR PUNITIVE DAMAGES ARISING FROM OR RELATING
                          TO THESE TERMS OR USER’S USE OF, OR INABILITY TO USE,
                          THE PLATFORM, THE WEBSITE OR THE SERVICE, CONTENT OR
                          INFORMATION ACCESSED VIA THE WEBSITE OR ANY
                          HYPERLINKED WEBSITE, OR ANY DISRUPTION OR DELAY IN THE
                          PERFORMANCE OF THE WEBSITE, THE PLATFORM, OR THE
                          SERVICE EVEN IF COMPANY HAS BEEN ADVISED OF THE
                          POSSIBILITY OF SUCH DAMAGES. ACCESS TO, AND USE OF,
                          THE PLATFORM IS AT USER’S OWN DISCRETION AND RISK, AND
                          USER WILL BE SOLELY RESPONSIBLE FOR ANY MONETARY LOSS
                          AND/OR DAMAGE TO ITS DEVICE OR COMPUTER SYSTEM, OR
                          LOSS OF DATA RESULTING THEREFROM. SOME JURISDICTIONS
                          DO NOT ALLOW THE LIMITATION OR EXCLUSION OF LIABILITY
                          FOR INCIDENTAL OR CONSEQUENTIAL DAMAGES, SO THE ABOVE
                          LIMITATION OR EXCLUSION MAY NOT APPLY TO USER. No
                          Warranties. ALL INFORMATION OR SERVICE PROVIDED BY
                          COMPANY TO USER VIA THE WEBSITE AND THE PLATFORM,
                          INCLUDING, WITHOUT LIMITATION, ALL CONTENT, IS
                          PROVIDED “AS IS” AND “WHERE IS” AND WITHOUT ANY
                          WARRANTIES OF ANY KIND. COMPANY AND ANY THIRD-PARTY
                          LICENSORS WITH CONTENT ON THE WEBSITE EXPRESSLY
                          DISCLAIM ALL WARRANTIES, WHETHER EXPRESS, IMPLIED OR
                          STATUTORY, INCLUDING, WITHOUT LIMITATION, THE
                          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A
                          PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
                          NOTWITHSTANDING ANY PROVISION CONTAINED HEREIN TO THE
                          CONTRARY, COMPANY AND AFFILIATES MAKE NO
                          REPRESENTATION, WARRANTY OR COVENANT CONCERNING THE
                          ACCURACY, QUALITY, SUITABILITY, COMPLETENESS,
                          SEQUENCE, TIMELINESS, SECURITY OR AVAILABILITY OF THE
                          WEBSITE, THE PLATFORM OR ANY CONTENT POSTED ON OR
                          OTHERWISE ACCESSIBLE VIA THE PLATFORM OR THE WEBSITE.
                          USER SPECIFICALLY ACKNOWLEDGES THAT COMPANY AND
                          AFFILIATES ARE NOT LIABLE FOR ANY DEFAMATORY, OBSCENE
                          OR UNLAWFUL CONDUCT OF THIRD-PARTIES OR USERS OF THE
                          WEBSITE OR THE PLATFORM AND THAT THE RISK OF INJURY
                          FROM THE FOREGOING RESTS ENTIRELY WITH USER. NEITHER
                          COMPANY NOR ANY OF ITS AFFILIATES REPRESENT, WARRANT,
                          OR COVENANT THAT THE WEBSITE AND/OR THE PLATFORM WILL
                          BE SECURE, UNINTERRUPTED OR ERROR-FREE. COMPANY
                          FURTHER MAKES NO WARRANTY THAT THE WEBSITE WILL BE
                          FREE OF VIRUSES, WORMS, OR TROJAN HORSES OR THAT IT
                          WILL FUNCTION OR OPERATE IN CONJUNCTION WITH ANY OTHER
                          PRODUCT OR SOFTWARE. USER EXPRESSLY AGREES THAT USE OF
                          THE PLATFORM IS AT USER’S SOLE RISK AND THAT COMPANY,
                          ITS AFFILIATES AND THEIR THIRD-PARTY LICENSORS SHALL
                          NOT BE RESPONSIBLE FOR ANY TERMINATION, INTERRUPTION
                          OF SERVICE, DELAYS, ERRORS, FAILURES OF PERFORMANCE,
                          DEFECTS, OR OMISSIONS ASSOCIATED WITH THE WEBSITE
                          AND/OR THE PLATFORM OR USER’S USE THEREOF. USER’S SOLE
                          REMEDY AGAINST COMPANY FOR DISSATISFACTION WITH THE
                          WEBSITE, THE PLATFORM, OR THE CONTENT IS TO CEASE ITS
                          USE OF THE PLATFORM AND THE WEBSITE. SOME
                          JURISDICTIONS DO NOT PERMIT THE EXCLUSION OR
                          LIMITATION OF IMPLIED WARRANTIES, SO THE ABOVE
                          EXCLUSION MAY NOT APPLY TO USER. USER MAY HAVE OTHER
                          RIGHTS, WHICH VARY BY JURISDICTION. WHEN THE IMPLIED
                          WARRANTIES ARE NOT ALLOWED TO BE EXCLUDED IN THEIR
                          ENTIRETY, USER AGREES THAT THEY WILL BE LIMITED TO THE
                          GREATEST EXTENT AND SHORTEST DURATION PERMITTED BY
                          LAW. TERM AND TERMINATION Subject to this Section and
                          Section 7.6, this Agreement will remain in full force
                          and effect while User uses the Platform, the Website,
                          or the Service (the “Term”). Company may suspend or
                          terminate User’s rights to use the Platform, the
                          Website, or the Service at any time for any reason at
                          Company’s sole discretion, including for any use of
                          the Website, the Platform, or the Service in violation
                          of this Agreement. User may terminate this Agreement
                          at any time by ending User’s use of the Platform and
                          notifying Company at support@ionprotocol.io Such
                          notice to Company must include User’s Wallet
                          address(es). Upon termination of User’s rights under
                          this Agreement, User’s right to access and use the
                          Platform will terminate immediately. Company will not
                          have any liability whatsoever to User for any
                          termination of User’s rights under this Agreement. All
                          provisions of the Agreement which by their nature
                          should survive, shall survive termination of Service,
                          including without limitation, ownership provisions,
                          warranty disclaimers, and limitation of liability.
                          GENERAL TERMS General Terms. These Terms, together
                          with the Privacy Policy and any other agreements
                          expressly incorporated by reference into these Terms,
                          are the entire and exclusive understanding and
                          agreement between User and Company regarding User’s
                          use of the Service. User may not assign or transfer
                          these Terms or its rights under these Terms, in whole
                          or in part, by operation of law or otherwise, without
                          Company’s prior written consent. Company may assign
                          these Terms at any time without notice or consent. The
                          failure to require performance of any provision will
                          not affect Company’s right to require performance at
                          any other time after that, nor will a waiver by
                          Company of any breach or default of these Terms, or
                          any provision of these Terms, be a waiver of any
                          subsequent breach or default or a waiver of the
                          provision itself. Use of section headers in these
                          Terms is for convenience only and will not have any
                          impact on the interpretation of any provision.
                          Throughout these Terms the use of the word “including”
                          means “including but not limited to”. If any part of
                          these Terms is held to be invalid or unenforceable,
                          the unenforceable part will be given effect to the
                          greatest extent possible, and the remaining parts will
                          remain in full force and effect. Electronic
                          Communications. By using the Website, the Platform, or
                          the Service, User consents to receiving certain
                          electronic communications from Company as further
                          described in the Privacy Policy. Please read the
                          Privacy Policy to learn more about Company’s
                          electronic communications practices. User agrees that
                          any notices, agreements, disclosures, or other
                          communications that Company sends to User
                          electronically will satisfy any legal communication
                          requirements. Any electronic communications will be
                          deemed to have been received by User immediately after
                          Company posts the same to the Website, whether or not
                          User has received or retrieved the communication from
                          Company. User agrees that these are reasonable
                          procedures for sending and receiving electronic
                          communications. If User wish to withdraw User’s
                          consent to receive Communications electronically, User
                          must discontinue use of the Platform.=Company reserves
                          the right, in its sole discretion, to discontinue the
                          provision of electronic communications, or to
                          terminate or change the terms and conditions on which
                          Company provides electronic communications. Company
                          will provide User with notice of any such termination
                          or change as required by Applicable Law. Changes to
                          these Terms of Use. Company may update or change these
                          Terms from time to time in order to reflect changes in
                          any offered services, changes in the law, or for other
                          reasons as deemed necessary by Company. The effective
                          date of any Terms will be reflected in the “Last
                          Revised” entry at the top of these Terms. User’s
                          continued use of the Website after any such change is
                          communicated shall constitute User’s consent to such
                          change(s). Governing Law & Jurisdiction. These Terms
                          are governed by the laws of the Republic of Panama,
                          without regard to its conflict of law principles. User
                          hereby irrevocably consents to the exclusive
                          jurisdiction and venue of the competent courts of the
                          Republic of Panama for all disputes arising out of or
                          relating to the use of the Platform, the Website, or
                          the Service not subject to the Arbitration Agreement
                          outlined in Section 14.5. Dispute Resolution
                          Arbitration Agreement Generally. Please read the
                          following arbitration agreement (“Arbitration
                          Agreement”) carefully. It limits the manner in which
                          User may seek relief from Company, is part of User’s
                          contract with Company, and contains provisions
                          concerning MANDATORY BINDING ARBITRATION AND WAIVER OF
                          THE RIGHT TO A TRIAL BY JURY OR TO PARTICIPATE IN A
                          CLASS ACTION. Exceptions. Nothing in these Terms will
                          be deemed to waive, preclude, or otherwise limit the
                          right of either party to seek injunctive relief in a
                          court of law in aid of arbitration or to file suit in
                          a court of law to address an intellectual property
                          infringement claim. Applicability of Arbitration
                          Agreement. In the interest of resolving disputes
                          between Company and User in the most expedient and
                          cost-effective manner, and except as set forth in
                          Section 14.5(b), User and Company agree that every
                          dispute arising in connection with these Terms that
                          cannot be resolved informally, whether based in
                          contract, tort, statute, fraud, misrepresentation, or
                          any other legal theory, including any unresolved
                          dispute, claim, interpretation, controversy, or issues
                          of public policy arising out of or relating to the
                          Website, the Platform, the Service, these Terms, and
                          the determination of the scope or applicability of
                          this Section 14.5 will be resolved by binding
                          arbitration on an individual basis under the terms of
                          this Arbitration Agreement. Unless otherwise agreed
                          to, all arbitration proceedings shall be held in
                          English. This Arbitration Agreement applies to User
                          and Company, and to any subsidiaries, Affiliates,
                          agents, employees, predecessors in interest,
                          successors, and assigns, as well as all authorized or
                          unauthorized users or beneficiaries of services or
                          goods provided under the Agreement. This Arbitration
                          Agreement shall apply, without limitation, to all
                          disputes or claims and requests for relief that arose
                          or were asserted before the effective date of this
                          Agreement or any prior version of this Agreement.
                          Arbitration Rules. Arbitration will be conducted and
                          administered by the Center for Conciliation and
                          Arbitration of the Chamber of Commerce, Industries,
                          and Agriculture of Panama (“CeCAP”) and its dispute
                          resolution rules (“CeCAP Rules”), as modified by these
                          Terms. The CeCAP rules are available online
                          at https://cecap.com.pa/en/reglamento-de-cecap/, or by
                          contacting Company. A single arbitrator will be
                          appointed unless otherwise required by the CeCAP
                          rules. Notice Requirement and Informal Dispute
                          Resolution. Before either party may seek arbitration,
                          the party must first send to the other party a written
                          Notice of Dispute (“Notice”) describing the nature and
                          basis of the claim or dispute, and the specific relief
                          requested. A Notice to Company should be sent by
                          certified U.S. Mail or by Federal Express (signature
                          required) to: Ion Protocol, Inc. Craigmuir Chambers
                          Road Town, Tortola, VG 1110 British Virgin Islands
                          User must send a courtesy copy of a Notice to Company
                          at support@ionprotocol.io. Company may send User a
                          Notice by electronic mail if User has provided Company
                          with such an address. Company may also provide Notice
                          to User’s Wallet by sending an NFT to User’s Wallet.
                          After the Notice is received, User and Company may
                          attempt to resolve the claim or dispute informally. If
                          User and Company do not resolve the claim or dispute
                          within thirty (30) days after the Notice is received,
                          either party may begin an arbitration proceeding. All
                          arbitration proceedings between the parties will be
                          confidential unless otherwise agreed by the parties in
                          writing. Fees; Location. Each party shall be
                          responsible for the payment of its own fees and costs
                          associated with an arbitration, except as otherwise
                          required by the CeCAP Rules. Any arbitration hearing
                          will take place in Panama City, Panama, or another
                          location mutually agreed upon by the parties;
                          provided, however, notwithstanding the foregoing, the
                          parties shall endeavor, where possible, to cause the
                          arbitration proceeding to be conducted: (i) solely on
                          the basis of documents submitted to the arbitrator; or
                          (ii) through a non-appearance-based telephone hearing
                          or videoconference. If the arbitrator finds that
                          either the substance of User’s claim or the relief
                          sought in User’s arbitration demand is frivolous or
                          brought for an improper purpose, in the arbitrator’s
                          reasonable discretion, then the payment of all
                          arbitration fees will be governed by the CeCAP Rules.
                          In that case, User agrees to reimburse Company for all
                          monies previously disbursed by Company that are
                          otherwise User’s obligation to pay under the CeCAP
                          Rules. Regardless of the manner in which the
                          arbitration is conducted, the arbitrator must issue a
                          reasoned written decision sufficient to explain the
                          essential findings and conclusions on which the
                          decision and award, if any, are based. Notwithstanding
                          anything herein to the contrary, each party will be
                          responsible for their own attorneys’ fees associated
                          with an arbitration under these Terms, and in no event
                          may the arbitrator award any party their attorneys’
                          fees. Enforcement. The parties irrevocably submit to
                          the exclusive jurisdiction of any court of competent
                          jurisdiction with respect to this section to compel
                          arbitration, to confirm an arbitration award or order,
                          or to handle court functions permitted under the CeCAP
                          Rules. The parties irrevocably waive defense of an
                          inconvenient forum to the maintenance of any such
                          action or other proceeding. The parties may seek
                          recognition and enforcement of any court judgment
                          confirming an arbitration award or order in any court
                          having jurisdiction with respect to recognition or
                          enforcement of such judgment. Waiver of Jury Trial.
                          THE PARTIES HEREBY WAIVE THEIR CONSTITUTIONAL AND
                          STATUTORY RIGHTS TO GO TO COURT AND HAVE A TRIAL IN
                          FRONT OF A JUDGE OR A JURY, instead electing that all
                          claims and disputes shall be resolved by arbitration
                          under this Arbitration Agreement. Arbitration
                          procedures are typically more limited, more efficient
                          and less costly than rules applicable in a court and
                          are subject to very limited review by a court. In the
                          event any litigation should arise between User and
                          Company in any court in a suit to vacate or enforce an
                          arbitration award or otherwise, USER AND COMPANY WAIVE
                          ALL RIGHTS TO A JURY TRIAL, instead electing that the
                          dispute be resolved by a judge. Waiver of Class or
                          Consolidated Actions. ALL CLAIMS AND DISPUTES WITHIN
                          THE SCOPE OF THIS AGREEMENT, INCLUDING THE ARBITRATION
                          AGREEMENT MUST BE ARBITRATED OR LITIGATED ON AN
                          INDIVIDUAL BASIS AND NOT ON A CLASS BASIS, AND CLAIMS
                          OF MORE THAN ONE CUSTOMER OR USER CANNOT BE ARBITRATED
                          OR LITIGATED JOINTLY OR CONSOLIDATED WITH THOSE OF ANY
                          OTHER CUSTOMER OR USER. 30-Day Right to Opt Out. User
                          has the right to opt out of the provisions of this
                          Arbitration Agreement by sending written notice of its
                          decision to opt out within thirty (30) days after
                          first becoming subject to this Arbitration Agreement.
                          User’s notice must include its name and address, its
                          Wallet address, and an unequivocal statement that User
                          desires to opt out of this Arbitration Agreement. If
                          User opts out of this Arbitration Agreement, all other
                          parts of this Agreement will continue to apply to
                          User. Opting out of this Arbitration Agreement has no
                          effect on any other arbitration agreements that User
                          may currently have, or may enter in the future, with
                          Company. Mail written notification by certified mail
                          to: Ion Protocol, Inc. Craigmuir Chambers Road Town,
                          Tortola, VG 1110 British Virgin Islands Severability.
                          If any part or parts of this Arbitration Agreement are
                          found under the law to be invalid or unenforceable by
                          a court of competent jurisdiction, then such specific
                          part or parts shall be of no force and effect and
                          shall be severed and the remainder of the Arbitration
                          Agreement shall continue in full force and effect.
                          Right to Waive. Any or all of the rights and
                          limitations set forth in this Arbitration Agreement
                          may be waived by the party against whom the claim is
                          asserted. Such waiver shall not waive or affect any
                          other portion of this Arbitration Agreement.
                          Attorneys’ Fees and Costs. In the event a party files
                          an action in a court of competent jurisdiction
                          pursuant to Section 14.5(b), the party found to be the
                          substantially losing party in any dispute shall be
                          required to pay the reasonable attorneys’ fees and
                          costs of any party determined to be the substantially
                          prevailing party. In the context of this Agreement,
                          reasonable attorneys’ fees and costs shall include but
                          not be limited to legal fees and costs, the fees and
                          costs of witnesses, accountants, experts, and other
                          professionals, and any other forum costs incurred
                          during, or in preparation for, a dispute. It is
                          understood that certain time entries that may appear
                          in the billing records of such party’s legal counsel
                          may be redacted to protect attorney-client or
                          work-product privilege, and this will not prevent
                          recovery for the associated billings. Third-Party
                          Beneficiaries. This Agreement and the rights and
                          obligations hereunder shall bind and inure to the
                          benefit of the parties and their successors and
                          permitted assigns. Nothing in this Agreement,
                          expressed or implied, is intended to confer upon any
                          person, other than the parties and their successors
                          and permitted assigns, any of the rights hereunder. No
                          Support or Maintenance. User acknowledges and agrees
                          that Company will have no obligation to provide User
                          with any support or maintenance in connection with the
                          Platform, Website, or Service. Company Contact
                          Information. Questions can be directed to Company at
                          support@ionprotocol.io
                          <span className="pt-12">
                            Ion Protocol, Inc. (“Company”) is committed to
                            protecting User’s privacy. Company has prepared this
                            Privacy Policy (this “Policy”) to describe to User
                            Company’s practices regarding the Personal
                            Information (as defined below) Company collects, why
                            Company collects it, and how Company uses and
                            discloses it. This Policy should be read in
                            conjunction with Company’s Terms of Use (the
                            “Terms”), into which this Policy is incorporated by
                            reference. User is encouraged to read the Terms
                            first, as certain terms used in this Policy are
                            defined in the Terms. ACCEPTANCE OF THE POLICY
                            User’s privacy matters to Company, so User should
                            take the time to get to know Company’s policies and
                            practices. Please understand that Company reserves
                            the right to change any of Company’s policies and
                            practices at any time, but User can always find the
                            latest version of this Policy here on this page.
                            User’s continued use of the Platform after Company
                            makes changes is deemed to be acceptance of those
                            changes, so please check this Policy periodically
                            for updates. This Policy describes the types of
                            information Company collects from User or that User
                            may provide when User uses the Platform and
                            Company’s practices for collecting, using,
                            maintaining, protecting, and disclosing that
                            information. Please read this Policy carefully to
                            understand Company’s practices regarding User’s
                            information and how Company will treat it. If User
                            does not agree with Company’s policies and
                            practices, then please do not use the Platform. By
                            using the Platform, User agrees to the terms of this
                            Policy. PERSONAL INFORMATION COMPANY COLLECTS As
                            used herein, “Personal Information” means
                            information that identifies or is reasonably capable
                            of identifying an individual, directly or
                            indirectly, and information that is capable of being
                            associated with an identified or reasonably
                            identifiable individual.  Personal Information
                            Company Collects from User. Company (or Company’s
                            Affiliates) may collect and store the following
                            categories of Personal Information directly from
                            User: Online identifier information, such as IP
                            address and login information, domain names, and
                            similar identifying names or addresses
                            (collectively, “Online Identifier Information”);
                            Device information, such as hardware, software,
                            operating system, browser, device name, language
                            preferences (collectively, “Device Information”);
                            Usage data, such as system activity, internal and
                            external information related to the Platform,
                            clickstream information (collectively, “Usage
                            Data”); and Geolocation data, such as information
                            about User’s device location (“Geolocation Data”).
                            Automatic collection of Personal Information may
                            involve the use of Cookies, described in greater
                            detail below. Company does not currently store
                            Online Identifier Information, Device Information,
                            Usage Data, or Geolocation Data on Company’s
                            systems; however, please be aware that third-parties
                            with which Company might interact might store such
                            information. Personal Information That May Be
                            Collected Automatically. Company (or Company’s
                            Affiliates) may collect and store the following
                            categories of Personal Information automatically
                            through User’s use of the Platform: Online
                            Identifier Information; and Additional information,
                            at Company’s discretion, to comply with legal
                            obligations. Personal Information Company Collects
                            from Third Parties. Company (or Company’s
                            Affiliates) may collect and/or verify the following
                            categories of Personal Information about User from
                            third parties: Online Identifier Information; Wallet
                            (as defined in the Terms) information, and
                            information connected to User’s use of the Platform;
                            and Additional information, at Company’s discretion,
                            to comply with legal obligations. Accuracy and
                            Retention of Personal Information. Company takes
                            reasonable and practicable steps to ensure that
                            User’s Personal Information held by Company is (i)
                            accurate with regard to the purposes for which it is
                            to be used, and (ii) not kept longer than is
                            necessary for the fulfillment of the purpose for
                            which it is to be used.  INTENDED FOR USERS 18+
                            Company does not knowingly collect data from or
                            market to anyone under 18 years of age. Company does
                            not knowingly solicit data from or market to anyone
                            under 18 years of age. By using the Platform, User
                            represents that User is at least 18 years old, or
                            that User is the parent or guardian of such a minor
                            and consents to such minor dependent’s use of the
                            Platform. If Company learns that Personal
                            Information, from Users less than 18 years of age
                            has been collected, Company will discontinue User’s
                            access to the Platform, to the extent that is
                            possible, and take reasonable measures to promptly
                            delete such data from Company’s records. If User
                            becomes aware of any data Company may have collected
                            from anyone under age 18, please contact Company at
                            support@ionprotocol.io. HOW COMPANY USES USER’S
                            PERSONAL INFORMATION Company collects Personal
                            Information about User in an attempt to provide User
                            with the best experience possible, protect User from
                            risks related to improper use and fraud, and help
                            Company maintain and improve the Platform. Company
                            may use User’s Personal Information to: Provide User
                            with the Platform. Company uses User’s Personal
                            Information to provide User with the Platform
                            pursuant to the Terms. Comply with Legal and
                            Regulatory Requirements. Company processes User’s
                            Personal Information as required by applicable laws
                            and regulations.  Detect and Prevent Fraud. Company
                            processes User’s Personal Information to detect and
                            prevent fraud. Protect the Security and Integrity of
                            the Platform. Company uses User’s Personal
                            Information to maintain the security of User’s
                            Wallet and the Platform itself.  Other Business
                            Purposes. Company may use User’s Personal
                            Information for additional purposes if disclosed to
                            User before Company collects User’s Personal
                            Information or if Company obtains User’s consent.
                            HOW COMPANY SHARES USER’S PERSONAL INFORMATION
                            Company will never sell, share, rent, or trade
                            User’s Personal Information with third parties for
                            their commercial purposes. Further, Company will not
                            share User’s Personal Information with third
                            parties, except as described below: Third-Party
                            Service Providers. Company may share User’s Personal
                            Information with third-party service providers for
                            business or commercial purposes, including fraud
                            detection and prevention, security threat detection,
                            customer support, data analytics, information
                            technology, advertising and marketing, network
                            infrastructure, storage, and transaction monitoring.
                            Company shares User’s Personal Information with
                            these service providers only so that they can
                            provide Company with their services, and Company
                            prohibits its service providers from using or
                            disclosing User’s Personal Information for any other
                            purpose. Law Enforcement. Company may be compelled
                            to share User’s Personal Information with law
                            enforcement, government officials, and/or
                            regulators.  Corporate Transactions. Company may
                            disclose Personal Information in the event of a
                            proposed or consummated merger, acquisition,
                            reorganization, asset sale, or similar corporate
                            transaction, or in the event of a bankruptcy or
                            dissolution.  Professional Advisors. Company may
                            share User’s Personal Information with Company’s
                            professional advisors, including legal, accounting,
                            or other consulting services for purposes of audits
                            or to comply with Company’s legal obligations.
                            Consent. Company may share User’s Personal
                            Information with User’s consent.  If Company decides
                            to modify the purpose for which User’s Personal
                            Information is collected and used, Company will
                            amend this Policy.  COOKIES When User accesses the
                            Platform, Company may make use of the standard
                            practice of placing tiny data files called cookies,
                            flash cookies, pixel tags, or other tracking tools
                            (herein, “Cookies”) on User’s computer or other
                            devices used to visit the Platform. Company uses
                            Cookies to help Company recognize User as a
                            customer, collect information about User’s use of
                            the Platform to better customize the Platform and
                            content for User, and collect information about
                            User’s computer or other access devices to: (i)
                            ensure that User’s Account security has not been
                            compromised by detecting irregular, suspicious, or
                            potentially fraudulent activities; and (ii) assess
                            and improve the Platform and advertising campaigns.
                            User can also learn more about Cookies by visiting
                            http://www.allaboutcookies.org, which includes
                            additional useful information on Cookies and how to
                            block Cookies on different types of browsers and
                            mobile devices. Please note that if User rejects
                            Cookies, User will not be able to use some or all of
                            the Service. If User does not consent to the placing
                            of Cookies on User’s device, please do not visit,
                            access, or use the Service. INFORMATION SECURITY No
                            security is foolproof, and the Internet is an
                            insecure medium. Company cannot guarantee absolute
                            security, but Company works hard to protect Company
                            and User from unauthorized access to or unauthorized
                            alteration, disclosure, or destruction of Personal
                            Information Company collects and stores. Measures
                            Company takes include encryption of Company website
                            communications with SSL; periodic review of
                            Company’s Personal Information collection, storage,
                            and processing practices; and restricted access to
                            User’s Personal Information on a need-to-know basis
                            for Company’s employees, contractors and agents who
                            are subject to strict contractual confidentiality
                            obligations and may be disciplined or terminated if
                            they fail to meet these obligations. INFORMATION FOR
                            PERSONS SUBJECT TO EU DATA PROTECTION LAW While
                            customers who are located in the European Union
                            (“EU”), European Economic Area (“EEA”) or the
                            Channel Islands, or other locations subject to EU
                            data protection law (collectively, “Europe”) are
                            customers of Company’s Panamanian entity, Company
                            recognizes and, to the extent applicable to Company,
                            adheres to relevant EU data protection laws. For
                            purposes of this section, “personal data” has the
                            meaning provided in the General Data Protection
                            Regulation (EU) 2016/679 (“GDPR”). Lawful Bases for
                            Processing. Company processes personal data subject
                            to GDPR on one or more of the following legal bases:
                            Legal Obligations: to conduct anti-fraud and to
                            fulfill Company’s retention and other legal
                            obligations; Contractual Obligations: to satisfy
                            Company’s obligations to User under the Terms,
                            including to provide User with the Platform and
                            customer support services, and to optimize and
                            enhance the Platform; Legitimate Interest: to
                            monitor the usage of the Platform, conduct automated
                            and manual security checks of the Platform, to
                            protect Company’s rights; and Consent: to market
                            Company and the Platform. User may withdraw User’s
                            consent at any time without affecting the lawfulness
                            of processing based on consent before consent is
                            withdrawn.  European Privacy Rights. European
                            residents have the following rights under GDPR,
                            subject to certain exceptions provided under the
                            law, with respect to their personal data: Rights to
                            Access and Rectification: User may submit a request
                            that Company disclose the personal data that Company
                            processes about User and correct any inaccurate
                            personal data. Right to Erasure: User may submit a
                            request that Company delete the personal data that
                            Company has about User. Right to Restriction of
                            Processing: User has the right to restrict or object
                            to Company’s processing of User’s personal data
                            under certain circumstances. Right to Data
                            Portability: User has the right to receive the
                            personal data User has provided to Company in an
                            electronic format and to transmit that personal data
                            to another data controller. To submit a request to
                            exercise these rights, please contact Company using
                            the methods described at the end of this Policy.
                            When handling requests to exercise European privacy
                            rights, Company checks the identity of the
                            requesting party to ensure that he or she is the
                            person legally entitled to make such request. This
                            will require User to provide Company with User’s
                            unique Wallet identification. While Company
                            maintains a policy to respond to these requests free
                            of charge, should User’s request be repetitive or
                            unduly onerous, Company reserves the right to charge
                            User a reasonable fee for compliance with User’s
                            request. COLLECTION AND TRANSFER OF DATA OUTSIDE THE
                            EEA The Platform operates with many of Company’s
                            systems based in the United States. As a result,
                            Company may transfer personal data to Europe, the
                            United States, or other third countries, under the
                            following conditions: Contractual Obligation. Where
                            transfers are necessary to satisfy Company’s
                            obligation to User under the Terms, including to
                            provide User with the Platform and customer support
                            services, and to optimize and enhance the Platform;
                            and Consent. Where User has consented to the
                            transfer of User’s personal data to another country.
                            Where transfers to a third country are based on
                            User’s consent, User may withdraw User’s consent at
                            any time. Please understand, however, that the
                            Platform may not be available if Company is unable
                            to transfer personal data to other countries. When
                            Company transfers personal data to third countries,
                            Company endeavors to ensure adequate safeguards are
                            implemented, for example through the use of standard
                            contractual clauses or Privacy Shield certification.
                            CCPA Pursuant to the California Consumer Privacy Act
                            (the “CCPA”), and in addition to the disclosures
                            elsewhere in this Policy, this section describes the
                            types of Personal Information that Company may have
                            collected, disclosed for business purposes, or sold
                            to third parties in the last 12 months.  Personal
                            Information Collected. Internet or other electronic
                            network activity information, geolocation
                            information, and inferences drawn from the
                            foregoing. To learn more about the information
                            Company collects, please see “Personal Information
                            Company Collects,” above. The sources of the
                            information are Users of the Platform and Company’s
                            Affiliates.  Disclosure of Personal Information. In
                            the last 12 months, Company may have disclosed the
                            following categories of Personal Information to
                            Company’s Affiliates or to third-party service
                            providers for business purposes: internet or other
                            electronic network activity information, geolocation
                            information, and inferences drawn from the
                            foregoing. To learn more, please see “How Company
                            Shares User’s Personal Information” above.  “Sale”
                            of Personal Information. In the last 12 months,
                            Company may have “sold” (as defined in the CCPA) the
                            following categories of Personal Information:
                            internet or other electronic network activity
                            information, geolocation information, and inferences
                            drawn from the foregoing. Company does not have
                            actual knowledge that Company sells Personal
                            Information of consumers under 21 years of age. To
                            learn more, please see “How Company Shares User’s
                            Personal Information” above.  Explanation of “Sales”
                            under CCPA. Company is not in the business of
                            collecting and selling data, but, in some cases,
                            Company may share information with Company’s
                            Affiliates or third-party service providers in a
                            transaction that constitutes a “sale” of Personal
                            Information under California law.  CONTACT US If
                            User has questions or concerns regarding this policy
                            or Company’s use of User’s Personal Information,
                            please feel free to email Company at
                            support@ionprotocol.io; or write to Company at: Ion
                            Protocol, Inc. Attn: Chunda McCain
                            support@ionprotocol.io
                          </span>
                        </p>

                        <div className="flex items-center space-x-1 w-full mt-4 pl-2">
                          <input
                            type="checkbox"
                            className="bg-white mb-1"
                            checked={termsTicked}
                            onClick={() => setTermsTicked(!termsTicked)}
                          />
                          <p
                            className="cursor-pointer"
                            onClick={() => setTermsTicked(!termsTicked)}
                          >
                            I agree to terms and conditions
                          </p>
                        </div>
                        <div className="mt-4">
                          <Button
                            variant={termsTicked ? 'static' : 'disabled'}
                            className="p-2 px-4"
                            onClick={() => {
                              setTermsAccepted(true)
                              setShowTerms(false)
                            }}
                          >
                            Accept
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </footer>
  )
}
export default Footer

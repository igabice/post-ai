import Link from 'next/link';

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose dark:prose-invert max-w-4xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>
        <h1>Terms and Conditions</h1>
        <p>Last updated: September 16, 2025</p>

        <p>
          Please read these terms and conditions carefully before using Our
          Service.
        </p>

        <h2>Interpretation and Definitions</h2>
        <h3>Interpretation</h3>
        <p>
          The words of which the initial letter is capitalized have meanings
          defined under the following conditions. The following definitions shall
          have the same meaning regardless of whether they appear in singular or in
          plural.
        </p>
        <h3>Definitions</h3>
        <p>For the purposes of these Terms and Conditions:</p>
        <ul>
          <li>
            <strong>Application</strong> means the software program provided by the
            Company downloaded by You on any electronic device, named Content
            Compass.
          </li>
          <li>
            <strong>Company</strong> (referred to as either "the Company", "We",
            "Us" or "Our" in this Agreement) refers to Content Compass Inc.
          </li>
          <li>
            <strong>Country</strong> refers to: United States
          </li>
          <li>
            <strong>Service</strong> refers to the Application.
          </li>
          <li>
            <strong>Terms and Conditions</strong> (also referred as "Terms") mean
            these Terms and Conditions that form the entire agreement between You
            and the Company regarding the use of the Service.
          </li>
          <li>
            <strong>You</strong> means the individual accessing or using the
            Service, or the company, or other legal entity on behalf of which such
            individual is accessing or using the Service, as applicable.
          </li>
        </ul>

        <h2>Acknowledgment</h2>
        <p>
          These are the Terms and Conditions governing the use of this Service and
          the agreement that operates between You and the Company. These Terms and
          Conditions set out the rights and obligations of all users regarding the
          use of the Service.
        </p>
        <p>
          Your access to and use of the Service is conditioned on Your acceptance
          of and compliance with these Terms and Conditions. These Terms and
          Conditions apply to all visitors, users and others who access or use the
          Service.
        </p>
        <p>
          By accessing or using the Service You agree to be bound by these Terms
          and Conditions. If You disagree with any part of these Terms and
          Conditions then You may not access the Service.
        </p>

        <h2>Termination</h2>
        <p>
          We may terminate or suspend Your access immediately, without prior notice
          or liability, for any reason whatsoever, including without limitation if
          You breach these Terms and Conditions.
        </p>
        <p>
          Upon termination, Your right to use the Service will cease immediately.
        </p>

        <h2>Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by applicable law, in no event shall the
          Company or its suppliers be liable for any special, incidental,
          indirect, or consequential damages whatsoever (including, but not limited
          to, damages for loss of profits, loss of data or other information, for
          business interruption, for personal injury, loss of privacy arising out
          of or in any way related to the use of or inability to use the Service,
          third-party software and/or third-party hardware used with the Service,
          or otherwise in connection with any provision of this Terms), even if the
          Company or any supplier has been advised of the possibility of such
          damages and even if the remedy fails of its essential purpose.
        </p>

        <h2>"AS IS" and "AS AVAILABLE" Disclaimer</h2>
        <p>
          The Service is provided to You "AS IS" and "AS AVAILABLE" and with all
          faults and defects without warranty of any kind. To the maximum extent
          permitted under applicable law, the Company, on its own behalf and on
          behalf of its Affiliates and its and their respective licensors and
          service providers, expressly disclaims all warranties, whether express,
        </p>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about these Terms and Conditions, You can
          contact us:
        </p>
        <ul>
          <li>By email: contact@contentcompass.com</li>
        </ul>
      </div>
    </div>
  );
}

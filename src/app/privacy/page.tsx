import Link from 'next/link';

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="prose dark:prose-invert max-w-4xl mx-auto">
        <Link href="/" className="text-primary hover:underline mb-8 block">&larr; Back to App</Link>
        <h1 className="text-4xl font-bold">Privacy Policy</h1>
        <p>Last updated: September 16, 2025</p>

        <p>
          This Privacy Policy describes Our policies and procedures on the collection,
          use and disclosure of Your information when You use the Service and tells
          You about Your privacy rights and how the law protects You.
        </p>

        <h2>Collecting and Using Your Personal Data</h2>
        <h3>Types of Data Collected</h3>
        <h4>Personal Data</h4>
        <p>
          While using Our Service, We may ask You to provide Us with certain
          personally identifiable information that can be used to contact or
          identify You. Personally identifiable information may include, but is not
          limited to:
        </p>
        <ul>
          <li>Email address</li>
          <li>First name and last name</li>
          <li>Usage Data</li>
        </ul>
        <h4>Usage Data</h4>
        <p>Usage Data is collected automatically when using the Service.</p>
        <p>
          Usage Data may include information such as Your Device's Internet
          Protocol address (e.g. IP address), browser type, browser version, the
          pages of our Service that You visit, the time and date of Your visit,
          the time spent on those pages, unique device identifiers and other
          diagnostic data.
        </p>

        <h2>Use of Your Personal Data</h2>
        <p>The Company may use Personal Data for the following purposes:</p>
        <ul>
          <li>
            <strong>To provide and maintain our Service</strong>, including to
            monitor the usage of our Service.
          </li>
          <li>
            <strong>To manage Your Account:</strong> to manage Your registration
            as a user of the Service. The Personal Data You provide can give You
            access to different functionalities of the Service that are available
            to You as a registered user.
          </li>
          <li>
            <strong>For the performance of a contract:</strong> the development,
            compliance and undertaking of the purchase contract for the products,
            items or services You have purchased or of any other contract with Us
            through the Service.
          </li>
        </ul>

        <h2>Contact Us</h2>
        <p>
          If you have any questions about this Privacy Policy, You can contact us:
        </p>
        <ul>
          <li>By email: contact@contentcompass.com</li>
        </ul>
      </div>
    </div>
  );
}

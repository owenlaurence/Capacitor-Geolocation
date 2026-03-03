### Building a Next.js app for iOS & Android with Plugins for full native support

In this document, we will create an application and implement native-level geolocation.   
The repository is available above if you prefer to follow along instead.

### Project Setup
Start with creating a next.js app
~~~ bash
npx create-next-app@latest
~~~
Name your application and follow the prompts.  
This example will use Typescript, ESLint, Tailwind, and App Router. You may change this configuration, but App Router is highly recommended.

From the root of your new Next.js application, install the necessary Capacitor packages: 
~~~ bash
npm install @capacitor/core
npm install -D @capacitor/cli
~~~

Modify your **next.config.ts** file by adding the output property:
~~~ TS
const nextConfig: NextConfig = {
  output: "export"
};
~~~
~~~ bash
npm run build
~~~
This will build our next.js application to a directory named "out".
> Note: Setting output to **export** will remove our ability to render server-side. Capacitor does not support SSR or server-actions, since mobile applications are hosted by App Store providers.

Next, update your **capacitor.config.ts** file to point to our new **out** directory.
~~~ TS
const config: CapacitorConfig = {
  ...
  webDir: 'out'
};

~~~


Use the @capacitor/cli tool to initiate an ios project and add your native platform(s): 

~~~ bash
npx cap init
npm install @capacitor/ios      # if you want ios
npm install @capacitor/android  # if you want android
npx cap sync  # sync your next.js build with mobile platforms
~~~

<details open>

<summary>iOS</summary>

Install the iOS SDK for react
~~~ bash
npx cap add ios     
~~~

Then open your iOS app in Xcode with the capacitor cli: 
~~~ bash
npx cap open ios
~~~

With XCode open, run your application to verify proper installation.

Alternatively, you may run the command:
~~~bash
npx cap run ios
~~~
To run directly from the command line. Running from XCode is preferred when you need debugging capabilities.

</details>


<details>

<summary>Android</summary>

Install the Android SDK for react
~~~bash
npm install @capacitor/android
~~~

Then open your iOS app in Xcode with the capacitor cli: 
~~~bash
npx cap open android
~~~


</details>

### Geolocation Prompts
Now that our native applications are set up, we will focus on configuring our geolocation prompts.   
Install the official geolocation plugin:
~~~bash
npm install @capacitor/geolocation
~~~

For iOS, Add the following to your info.plist file (./ios/App/App/Info.plist):
~~~ XML
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This application uses your location.</string>
~~~

Now we will replace our generated page.tsx component with: 
~~~tsx
"use client"
import { useState } from "react";
import { Geolocation, Position } from "@capacitor/geolocation";

export default function LocationComponent() {
  const [location, setLocation] = useState<Position | null>(null);
  const [error, setError] = useState<string | null>(null);

  const getLocation = async () => {
    try {

      // Must start by requesting permission. This results in the system-native prompt.
      await Geolocation.requestPermissions();

      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,   // High accuracy gives us GPS style coords. 
        timeout: 10000,
        maximumAge: 0,
      });

      setLocation(position);
      setError(null);
    } 
    catch (err : any) { 
      setError(err.message);
    }
  };

  return (
    // adjust styling if not using tailwind.
    <div className="flex flex-col items-center justify-center h-screen"> 
      <button style={{ color: "blue" }} onClick={getLocation}>Get Location</button>

      {location && (
        <div>
          <p>Latitude: {location.coords.latitude}</p>
          <p>Longitude: {location.coords.longitude}</p>
        </div>
      )}

      {/* Catch any errors (likely an issue with info.plist) */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
~~~

Now create a new build and run our mobile application
~~~ bash
npm run build 
npx cap sync ios 
npx cap run ios
~~~

You will see your *Get Location* button. Clicking the button will request permission (if not already granted) and render the devices coordinates.   

### Retrospective
While this is a limited use-case, this application demonstrates the implementation and ease-of-use of Capacitor. This logic can be applied to other native APIs such as Push Notifications, Camera operations, Haptics, etc. for full control of your new native application.   
<br>
While this is great progress, we have more work to do. We need to deliver this application to our users. Why not [completely automate the process](/topic/pipeline-ios) while we're at it!


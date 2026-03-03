### Building a Next.js App for iOS & Android with Capacitor and Native API Support

In this document, we will create an application and implement native-level geolocation.   
The repository is available above if you prefer to follow along instead.

### Project Setup
Start with creating a Next.js app
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
  output: "export",   // tells Next.js to generate static HTML.
  trailingSlash: true // Nice to have in case you decide to build routes.
};
~~~
~~~ bash
npm run build
~~~
This will build our Next.js application to a directory named "out".
> Note: Setting output to **export** will remove our ability to render server-side. Capacitor does not support SSR or server-actions, since mobile applications are hosted by App Store providers.

Next, update your **capacitor.config.ts** file to point to our new **out** directory.
~~~ TS
const config: CapacitorConfig = {
  ...
  webDir: 'out'
};

~~~


Use the @capacitor/cli tool to initiate an iOS project and add your native platform(s): 

~~~ bash
npx cap init
npm install @capacitor/ios      # if you want iOS
npm install @capacitor/android  # if you want Android
~~~
> <code>init</code> will ask for App name and App ID. App ID should be in reverse-domain format. ex: *com.domain.appName*

<details open>


<summary>iOS</summary>

Ensure [Xcode](https://apps.apple.com/us/app/xcode/id497799835?mt=12) is installed before creating an Android project.

Create the Xcode project and sync with build
~~~ bash
npx cap add ios     
npx cap sync ios 
npx cap open ios 

~~~

> If you encounter errors, make sure you have an *out* directory from previous steps.

With Xcode open, run your application to verify proper installation.

#### Set the required permissions for Geolocation
Open <code>Info.plist</code> and add the following:
~~~ XML
<key>NSLocationAlwaysAndWhenInUseUsageDescription</key>
<string>This application uses your location.</string>

<key>NSLocationWhenInUseUsageDescription</key> 
<string>This application uses your location.</tring>
~~~

In subsequent builds, you may build your app directly from the command line like so:
~~~bash
npx cap run ios
~~~
so that you do not need to open Xcode every time.


</details>


<details>

<summary>Android</summary>

Ensure [Android Studio](https://developer.android.com/studio) is installed before creating an Android project.

Create the Android project and sync with build
~~~ bash
npx cap add android
npx cap sync android
npx cap open android

~~~
> If you encounter errors, make sure you have an *out* directory from previous steps.

With Android Studio open, run your application to verify proper installation.


#### Set the required permissions for Geolocation
Open <code>AndroidManifest.xml</code> and add the following:
~~~ XML
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" /> 
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-feature android:name="android.hardware.location.gps" />
~~~


</details>

### Geolocation Prompts
Now that our native applications are set up, we will focus on configuring our geolocation prompts.   
Install the official geolocation plugin:
~~~bash
npm install @capacitor/geolocation
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

      // If permission not already granted, this results in the system-native prompt.
      // Android may not require the prompt.
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

      {/* When running this app on web, the error will be 'Not Implemented on web'. */}
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}
~~~

Now create a new build and run our mobile application
~~~ bash
npm run build 

# ios
npx cap sync ios  
npx cap run ios

# android
npx cap sync android  
npx cap run android
~~~

You will see your *Get Location* button. Clicking the button will request permission (if not already granted) and render the devices coordinates.   

### Retrospective
While this is a limited use-case, this application demonstrates the implementation and ease-of-use of Capacitor. This logic can be applied to other native APIs such as Push Notifications, Camera operations, Haptics, etc. for full control of your new native application.   
<br>
While this is great progress, we have more work to do. We need to deliver this application to our users. Why not [completely automate the process](/topic/pipeline-ios) while we're at it!



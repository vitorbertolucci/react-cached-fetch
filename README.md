<!-- omit in toc -->
# react-cached-fetch

A simple react hook for data fetching with cache. It serves the cached version while waiting for the data to be fetched and then updates the cache with the fetched result. It is great for grids, lists or any other page that loads data.
<br/><br/>

<!-- omit in toc -->
# Features:<br/>
✅ 0 dependencies<br/><br/>
✅ Unopinionated<br/>
You can use it with any HTTP client
<br/><br/>
✅ Chained calls<br/>
react-cached-fetch lets you easily fetch data that depends on data returned by other API calls
<br/><br/>
✅ Programmatic refresh <br/>
You can trigger refreshes programmatically
<br/><br/>
✅ Silent refresh <br/>
You can silently send a new GET request to your API and have your UI updated automatically when it gets fullfiled
<br/><br/>
✅ TypeScript ready<br/>
This library if fully written in TypeScript and supports generic types. You can use it both with plain JavaScript or with TypeScript
<br/><br/>

<!-- omit in toc -->
# Table of Contents
- [Installation](#installation)
- [Usage](#usage)
- [API](#api)
  - [CachedFetchProvider](#cachedfetchprovider)
  - [useCachedFetch](#usecachedfetch)
  - [Options](#options)
  - [Global Options](#global-options)
- [Usage with other HTTP clients](#usage-with-other-http-clients)
- [Usage with Typescript](#usage-with-typescript)
- [🤝 Contributing](#-contributing)
- [License](#license)

# Installation

Simply run:

```
yarn add react-cached-fetch
```

or:

```
npm install react-cached-fetch
```
<br/>

# Usage

Since the hook uses Context API to store the cached data, you must first wrap your app component (or only the part of your app where you want the cache to be available) with **CachedFetchProvider**.

```javascript
import React from "react";
import { CachedFetchProvider } from "react-cached-fetch";

const App = () => {
  return (
    <CachedFetchProvider>
      <div className="App"></div>
    </CachedFetchProvider>
  );
};
```

Then you can use the **useCachedFetch** hook in your components.

```javascript
import React from "react";
import { useCachedFetch } from "react-cached-fetch";

const UserList = () => {
  const { data: users, isLoading, hasError, refresh } = useCachedFetch(
    "http://my-api/users"
  );

  if (hasError) return <div>There was an error loading the data</div>;

  return (
    <div>
      <div>
        {data ? (
          users.map((user, key) => <span key={key}>{user.Name}</span>)
        ) : (
          <span>There are no users on our database</span>
        )}
      </div>
      {isLoading && <span>Updating list...</span>}

      <button onClick={refresh}>Manually trigger refresh</button>
    </div>
  );
};

export default UserList;
```
<br/>

# API

## CachedFetchProvider

The **CachedFetchProvider** must be used to wrap all components that will use **useCachedFetch** hook in order for them to access the cached data. It is tipically used to wrap the entire App component, but you could use it at any component tree level.

<br/>

**Properties**

| Property           | type                          | required                                      | description                                                                                                                                                                                                                                                                                                                                                                                                 |
| ------------------ | ----------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| globalOptions?     | object                        | no                                            | Global options that will be passed with every call of useCachedFetch, [explained below](#global-options).                                                                                                                                                                                                                                                                                                   |
| persistence?       | 'none', 'session', or 'local' | no                                            | The persistence strategy you'd like to use to store the cached data. 'session' means browser's session storage, 'local' means browser's local storage and 'none' means that the data will only be stored in memory. Defaults to 'none'.                                                                                                                                                                     |
| persistencePrefix? | string                        | yes, if persistence is different than 'none'. | The prefix to be used in the session/local storage's key. Example: if you set persistencePrefix to '@MyApp', the cache key will be '@MyApp-react-cached-fetch'. An error will be thrown if you set persistence to 'local' or 'session' and fail to provide a persistencePrefix. It is made like this to avoid conflicts when using react-cached-fetch in multiple apps on the same development environment. |

<br /><br />

## useCachedFetch

The **useCachedFetch** hook can be used to serve cached data while it fetches new data from a specified endpoint. It will perform the fetching automatically once when the component who's calling it is rendered, and it is also possible to trigger other fetches programmatically by calling the **refresh** function returned from it. Whenever the fetcher function gets triggered, it saves the request result in a cache whose key is the provided endpoint, so this new data can be returned by the hook while it waits for an update whenever the component gets remounted.
<br/>

**Arguments**

| Argument | type   | required | description                                                         |
| -------- | ------ | -------- | ------------------------------------------------------------------- |
| route    | string | yes      | The enpoint to which the fetcher function will send the GET request. |
| options? | object | no       | Aditional options, [explained below](#options).                     |

<br/>

**Returned results**

The return value of **useCachedFetch** is an object containing the following properties:

| Property  | type     | default   | description                                                                              |
| --------- | -------- | --------- | ---------------------------------------------------------------------------------------- |
| data      | any      | undefined | The remote data returned by the fetcher function.                                        |
| hasError  | boolean  | false     | A boolean indicating if there was an error while fetching the data.                      |
| isLoading | boolean  | false     | A boolean describing if the fetcher function is waiting for the request to be completed. |
| refresh   | function |           | A function to manually trigger the fetcher function and update the cache.                |

<br /><br />

## Options

The available options that may be passed to **useCachedFetch** are:

- **headers**: an object containg the headers to be sent with the request. Defaults to `{}`.

- **fetcher**: the fetcher function used to obtain the data. Defaults to

```javascript
async (route: string, headers: IHeaderOptions): Promise<any> => {
  const response = await fetch(route, { headers });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || response.statusText || 'Request failed.',
    );
  }

  return result;
}
```

- **initialValue**: the initial value for the **data** property returned by **useCachedFetch**. Defaults to `undefined`.

- **dependencies**: an array with dependencies on which the fetcher function depends on to be triggered. The array must only contain boolean values. The hook will wait until all values on the array are true before calling the fetcher function. It is useful in cases where you have to make sure of something before fetching the data, like veryfing an authentication token or chaining calls. Here is an example:

```javascript
const UserInformationDashboard = () => {
  const { data: user } = useCachedFetch("users", {
    initialValue: {
      id: ''
    }
  });

  const { data: userDetails } = useCachedFetch(`userDetails/${user.id}`, {
    initialValue: {
      name: "",
      posts: 0
    },
    dependencies: [!!user.id]
  });

  return <>Your Code</>;
};
```

In the example above the request to **userDetails/:id** will only be made once the request to **users** has been fulfilled.
<br/><br/>

## Global Options

It is also possible to globally provide all available options so that every call to **useCachedFetch** will use them. You can do so by passing the **globalOptions** property to **CachedFetchProvider**:

```javascript
import React from "react";
import { CachedFetchProvider } from "react-cached-fetch";

import { useAuth } from './src/hooks/auth';

const App = () => {
  const { jwt } = useAuth() // Get a JWT to check if the user is authenticated

  return (
    <CachedFetchProvider
      globalOptions={{
        headers: {
          mode: "cors",
          authorization: `Bearer ${jwt}`
        },
        initialValue: []
      }}
    >
      <div className="App"></div>
    </CachedFetchProvider>
  );
};
```

Note that the options passed as argument to **useCachedFetch** will override the **globalOptions**. Therefore, if you use the globalOptions shown above and then make a call to useCachedFetch like this:

```javascript
const { data } = useCachedFetch("http://my-api/lists", {
  initialValue: {}
});
```

The `initialValue` of data will be `{}` and the headers option defined as `globalOptions` will be kept.
<br/><br/>

# Usage with other HTTP clients

By default, the hook uses the standard fetch API to request the data, but you can use any other client you want by passing your custom fetcher function:

```javascript
import React from "react";
import axios from "axios";
import { useCachedFetch } from "react-cached-fetch";

const UserList = () => {
  const { data, isLoading, hasError, refresh } = useCachedFetch(
    "http://my-api/users",
    {
      fetcher: async (route, headers) => {
        const { data } = await axios.get(route, { headers });
        return data;
      }
    }
  );

  return <div></div>;
};

export default UserList;
```

Of course you could also pass your custom fetcher function as a global option, so it would be used everytime you call **useCachedFetch**. This is a great way to take advantage of axios' baseURL and default headers.
<br/><br/>

# Usage with Typescript

You can preset the type of the data you are fetching by passing it's type to **useCachedFetch** hook. Here is an example:

```javascript
import React from "react";
import axios from 'axios';
import { useCachedFetch } from "react-cached-fetch";

interface IPost {
  id: string;
  title: string;
  content: string;
  likes: number;
};

const PostsList: React.FC = () => {
  const { data: posts, isLoading, hasError, refresh } = useCachedFetch<IPost[]>(
    "http://my-api/posts",
    {
      fetcher: async (route, headers) => {
        const { data } = await axios.get<IPost[]>(route, { headers });
        return data;
      },
      initialValue: []
    }
  );

  return <div></div>;
};

export default PostsList;
```

By doing this, you are typing your data as an array of posts. The type will also be extended to the fetcher function, that will have a return type of `Promise<IPost[]>` and to the `initialValue` option.
<br/><br/>

# 🤝 Contributing

Contributions, issues and feature requests are welcome.
Feel free to check [issues page](https://github.com/vitorbertolucci/react-cached-fetch/issues) if you want to contribute.
<br/><br/>

# License

This project is [MIT Licensed](https://github.com/vitorbertolucci/react-cached-fetch/blob/main/LICENSE)

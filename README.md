# react-cached-fetch

A simple react hook for data fetching with cache. It serves the cached version while waiting for the data to be fetched and then updates the cache with the fetched result.

Features:  
✅ Unopinionated  
✅ 0 dependencies  
✅ TypeScript ready  
✅ Chained calls  
✅ Allows programmatic refresh

## Installation

```
yarn add react-cached-fetch
```

or

```
npm install react-cached-fetch
```

## Usage

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

### Arguments

The **useCachedFetch** hook accepts two arguments:
| Argument | type | required |
| ------ | ------ | ------ |
| route | string | yes |
| options? | object | no |

### Returned results

The return value of **useCachedFetch** is an object containing the following properties:
| Property | type | default | description |
| ------ | ------ | ------ | ------ |
| data | any | undefined | The remote data returned by the fetcher function |
| hasError | boolean | false | A boolean indicating if there was an error while fetching the data |
| isLoading | boolean | false | A boolean describing if the fetcher function is waiting for the request to be completed |
| refresh | function | | A function to manually trigger the fetcher function and update cache |

### Options

The available options are:

- **headers**: the headers sent with the request. Defaults to

```javascript
{
  method: "GET";
}
```

- **fetcher**: the fetcher function used to obtain the data. Defaults to

```javascript
async (route, header) => {
  const response = await fetch(route, { headers });
  const result = await response.json();
  return result;
};
```

- **initialValue**: the initial value for the **data** property. Defaults to undefined.

- **dependencies**: an array with dependencies on which the fetcher function depends on to be triggered. The array must only contain boolean values. The hook will wait until all values on the array are true before calling the fetcher function. It is useful in cases where you have to make sure of something before fetching the data, like veryfing an authentication token or chaining calls. Here is an example:

```javascript
const UserInformationDashboard = () => {
  const { data: user } = useCachedFetch("users", {
    initialValue: null
  });
  const { data: userDetails } = useCachedFetch(`userDetails/${user.id}`, {
    initialValue: {
      name: "",
      posts: 0
    },
    dependencies: [user !== null]
  });

  return <>Your Code</>;
};
```

In the example above the request to **userDetails:/id** will only be made once the request to **users** has been fulfilled.

### Usage with other HTTP clients

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

### Providing global options

It is also possible to globally provide all available options so that every call to **useCachedFetch** will use them. You can do so by passing the **globalOptions** prop to **CachedFetchProvider**:

```javascript
import React from "react";
import axios from "axios";
import { CachedFetchProvider } from "react-cached-fetch";

const App = () => {
  return (
    <CachedFetchProvider
      globalOptions={{
        headers: {
          method: "GET",
          mode: "cors"
        },
        fetcher: async (route, headers) => {
          const { data } = await axios.get(route, { headers });
          return data;
        }
      }}
    >
      <div className="App"></div>
    </CachedFetchProvider>
  );
};
```

Note that the options passed as argument to **useCachedFetch** will override the globalOptions. Therefore, if you use the globalOptions shown above and then make a call to useCachedFetch like this:

```javascript
useCachedFetch("http://my-api/lists", {
  fetcher: async (route, headers) => {
    const { data } = axios.get(route, { headers });
    return data.lists;
  }
});
```

The new fetcher function will be used and the headers option defined as globalOption will be kept.

## 🤝 Contributing

Contributions, issues and feature requests are welcome.
Feel free to check [issues page](https://github.com/vitorbertolucci/react-cached-fetch/issues) if you want to contribute.

## License

This project is [MIT Licensed](https://github.com/vitorbertolucci/react-cached-fetch/blob/main/LICENSE)

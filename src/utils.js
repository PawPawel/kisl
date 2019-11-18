import { userInfo } from "os";

const authenticate = async(username, password) => {
    const data = {
        email: "sam@corcos.io"
      }
      console.log(data);

    const response = await fetch('/api/activedirectory', {
        method: "POST",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    const json = await response.json();
    console.log(json);
    return json;
};

export default authenticate;

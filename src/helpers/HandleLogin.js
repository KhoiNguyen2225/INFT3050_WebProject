//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is for handling the login process for both customers and admins
//Last modified: 11/03/2024
import axios from 'axios';
import validator from 'validator';

async function sha256(message) {
    // encode as UTF-8
    const msgBuffer = new TextEncoder().encode(message);
    // hash the message
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    // convert ArrayBuffer to Array
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    // convert bytes to hex string
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
    }

    
const HandleLogin = (username, password) => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    }

    //define roles for users logging in
    const cusRole = 'Customer';
    const adminRole = 'Admin';

    var token = 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ';
    //
    //Login for Patrons using email and password
    //
    if(validator.isEmail(username)){
        return axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/Patrons?where=(Email,eq," + username + ")" ,
            { headers: headers}).then(response => {
                
                const salt = response.data.list[0].Salt;
                console.log("data list" ,response.data.list);
                console.log("salt", salt);
                
                //hash the input password
                return sha256(salt + password).then(input => {
                    console.log("Input Hashed: ", input);
                    console.log("Stored PW: ", response.data.list[0].HashPW);

                    //if the hashed password matches the stored password, login is successful
                    if(input === response.data.list[0].HashPW) {
                        console.log("Login successful");
                        const userID = response.data.list[0].UserID;
                        console.log("userid:" , userID);
                        return { role: cusRole, userID };
                    }
                    //if the hashed password does not match the stored password, login is unsuccessful
                    else {
                        console.log("Login unsuccessful");
                        return false;
                    }
                });
            }).catch(error => {
                console.error('Error fetching data:', error);
                return false;   
            });
        
    }
    //
    //Login for user/admin using username and password
    //
    else {
        return axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/User/" + username,
            { headers: { 'xc-token': token } }).then(response => {
    
                var salt = response.data.Salt;
                console.log(response.data);
                console.log(response.data.Salt);

                //hash the input password
                return sha256(salt + password).then(input => {
                    console.log("Input Hashed: ", input);
                    console.log("Stored PW: ", response.data.HashPW);

                    //if the hashed password matches the stored password, login is successful
                    if (input === response.data.HashPW) {
                        console.log("Login successful");
                        const userID = response.data.UserName;
                        console.log("userid:" , userID);
                        return { role: adminRole, userID };
                    }
                    //if the hashed password does not match the stored password, login is unsuccessful
                    else {
                        console.log("Login unsuccessful");
                        return false;
                    }
                });
            }).catch(error => {
                console.error('Error fetching data:', error);
                return false;
            });
        };
}
export default HandleLogin;
    

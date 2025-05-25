//INFT3050_Web_Programming
//Creators: Ngoc Minh Khoi Nguyen 3415999, Nhat Thien Ngo 3426450
//This file is the Staff Management page, where the admin can add, edit or delete staff information
//Last modified: 11/03/2024
import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from '@mui/material';
import axios from 'axios';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import CryptoJS from 'crypto-js';

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

const StaffManagement = () => {
    const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'xc-token': 'sPi8tSXBw3BgursDPmfAJz8B3mPaHA6FQ9PWZYJZ'
    };

    const generateSalt = () => {
        return CryptoJS.lib.WordArray.random(128 / 8).toString();
    }

    const [staffList, setStaffList] = useState([]);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

    const [currentAdmin, setCurrentAdmin] = useState(null);
    const [adminName, setAdminName] = useState('');
    const [adminEmail, setAdminEmail] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');
    const [adminIsAdmin, setAdminIsAdmin] = useState(false);

    const [newUserName, setNewUserName] = useState('');
    const [newPassword, setPassword] = useState('');
    
    // Fetch the list of staff from the User table
    const fetchStaffList = async () => {
        axios.get("http://localhost:8080/api/v1/db/data/v1/inft3050/User", { headers: headers })
        .then((response) => {
            console.log("Axios response from Patrons: ", response);
            setStaffList(response.data.list);
        });
    };

    useEffect(() => {
        // eslint-disable-next-line
        fetchStaffList();
    }, []);

    const handleAddAdmin = () => {
        console.log("Add Admin button clicked");
        setAdminName('');
        setAdminEmail('');
        setAdminIsAdmin(false);
        setOpenAddDialog(true);
    };

    const handleEditAdmin = (id) => {
        console.log(`Edit Admin button clicked for admin ${id}`);
        const currentAdmin = staffList.find((admin) => admin.UserName === id);
        setCurrentAdmin(id);
        setAdminName(currentAdmin.Name);
        setAdminEmail(currentAdmin.Email || '');
        setAdminIsAdmin(currentAdmin.IsAdmin);
        setOpenEditDialog(true);
    };
    
    const handleDeleteAdmin = (id) => {
        console.log(`Delete Admin button clicked for admin ${id}`);
        setCurrentAdmin(id);
        setOpenDeleteDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
        setNewUserName('');
        setPassword('');
        setAdminName('');
        setAdminEmail('');
        setEmailError('');
        setAdminIsAdmin(false);
        setPasswordError('');
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setCurrentAdmin(null);
        setAdminName('');
        setAdminEmail('');
        setEmailError('');
        setAdminIsAdmin(false);
    };

    const handleCloseDeleteDialog = () => {
        setCurrentAdmin(null);
        setOpenDeleteDialog(false);
    };

    async function handleSaveAdd(event) {
        event.preventDefault();

        // generate a random salt and hash the password
        const salt = generateSalt();
        const HashPW = await sha256(salt + newPassword);

        var newAdminIsAdmin = adminIsAdmin ? 'true' : 'false';

        // Create a new user object for User table
        const newAdminData = {
            "UserName": newUserName,
            "Email": adminEmail,
            "Name": adminName,
            "IsAdmin": newAdminIsAdmin,
            "Salt": salt,
            "HashPW": HashPW
        };

        // POST request to create a new user in the User table
        axios.post("http://localhost:8080/api/v1/db/data/v1/inft3050/User", newAdminData, { headers: headers })
            .then((response) => {
                console.log("Axios response from post: ", response);
                fetchStaffList(); // Refresh the list after saving
            })
            .catch((error) => {
                console.error("Error: ", error);
            });
        handleCloseAddDialog();
    };

    const handleSaveEdit = (event) => {
        event.preventDefault();
        console.log(`Save changes for admin ${currentAdmin}`);

        console.log("Event target: ", event.target);

        var newAdminIsAdmin = adminIsAdmin ? 'true' : 'false';

        // Create an updated user object for User table
        let updatedAdmin = {
            "Name": adminName,
            "Email": adminEmail,
            "IsAdmin": newAdminIsAdmin
        };

        console.log("Updated Admin: ", updatedAdmin);

        // PATCH request to update the user in the User table
        axios.patch(`http://localhost:8080/api/v1/db/data/v1/inft3050/User/${currentAdmin}`, updatedAdmin, { headers: headers })
            .then((response) => {
                console.log("Axios response from patch: ", response);
                fetchStaffList();
            })
            .catch((error) => {
                console.error("Error: ", error);
            });
        handleCloseEditDialog();
    };

    const handleConfirmDelete = () => {
        axios.delete(`http://localhost:8080/api/v1/db/data/v1/inft3050/User/${currentAdmin}`, { headers: headers })
            .then((response) => {
                console.log("Axios response from delete: ", response);
                fetchStaffList(); // Refresh the list after deleting
            })
            .catch((error) => {
                console.error("Error: ", error);
            });
        handleCloseDeleteDialog();
    };

    const handleEmailChange = (event) => {
        setAdminEmail(event.target.value);
        if (!/^[a-zA-Z0-9._:$!%-]+@[a-zA-Z0-9.-]+.[a-zA-Z]$/.test(event.target.value)) {
            setEmailError("Invalid email address");
        } else {
            setEmailError(false);
        }
    }

    const handlePasswordChange = (event) => {
        console.log(event.target.value);
        setPassword(event.target.value);
        if (event.target.value.length < 8) {
            setPasswordError("Password must be at least 8 characters long");
        } else {
            setPasswordError(false);
        }
    }

    return (
        <div className='mainBodyAdminFunction'>
            <h1>Staff Management</h1>
            <Button variant="contained" color="primary" onClick={handleAddAdmin}>
                Add Staff
            </Button>
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>ID</TableCell>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Is Admin?</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {staffList.map((staff) => (
                            <TableRow key={staff.UserName}>
                                <TableCell>{staff.UserName}</TableCell>
                                <TableCell>{staff.Name}</TableCell>
                                <TableCell>{staff.Email ? staff.Email : 'None'}</TableCell>
                                <TableCell>{staff.IsAdmin ? 'True' : 'False'}</TableCell>
                                <TableCell>
                                    <Button variant="contained" style={{ backgroundColor: '#3A83BB' }} onClick={() => handleEditAdmin(staff.UserName)}>
                                        Edit
                                    </Button>
                                    <Button variant="contained" color="error" onClick={() => handleDeleteAdmin(staff.UserName)}>
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Add Admin Dialog */}
            <Dialog open={openAddDialog} onClose={handleCloseAddDialog}>
                <DialogTitle>Add New Staff</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Enter the details for the new staff below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="User Name"
                        type="text"
                        fullWidth
                        value={newUserName}
                        onChange={(e) => setNewUserName(e.target.value)}
                    />
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Full Name"
                        type="text"
                        fullWidth
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Email"
                        type="email"
                        fullWidth
                        value={adminEmail}
                        onChange={handleEmailChange}
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <TextField
                        margin="dense"
                        label="Password"
                        type="password"
                        fullWidth
                        value={newPassword}
                        onChange={handlePasswordChange}
                        error={!!passwordError}
                        helperText={passwordError}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={adminIsAdmin}
                                onChange={(e) => setAdminIsAdmin(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Is Admin"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveAdd} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Edit Admin Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog}>
                <DialogTitle>Edit {currentAdmin}</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Make changes to the staff details below.
                    </DialogContentText>
                    <TextField
                        autoFocus
                        margin="dense"
                        label="Staff Name"
                        type="text"
                        fullWidth
                        value={adminName}
                        onChange={(e) => setAdminName(e.target.value)}
                    />
                    <TextField
                        margin="dense"
                        label="Staff Email"
                        type="email"
                        fullWidth
                        value={adminEmail}
                        onChange={handleEmailChange}
                        error={!!emailError}
                        helperText={emailError}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={adminIsAdmin}
                                onChange={(e) => setAdminIsAdmin(e.target.checked)}
                                color="primary"
                            />
                        }
                        label="Is Admin"
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseEditDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleSaveEdit} color="primary">
                        Save
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Delete Staff</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Are you sure you want to delete this account?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog} color="primary">
                        Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} color="error">
                        Delete
                    </Button>
                </DialogActions>
            </Dialog>

        </div>
    );
};

export default StaffManagement;

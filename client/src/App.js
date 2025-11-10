import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19'
import 'react-big-calendar/lib/css/react-big-calendar.css';

import SignUp from './components/SignUp';
import Login from './components/Login'; // Assuming you have the Login component
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import TwitterAuth from './pages/TwitterAuth';
import GroupForm from './components/GroupForm';
import GroupList from './components/GroupList';
import GroupDetails from './pages/GroupDetails';
import GroupManagement from './pages/GroupManagement';
import ConnectAccounts from './pages/ConnectAccounts';
import AddTeamMember from './pages/AddTeamMember';

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
        {/* Normal Routes */}
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<Login/>} />
        <Route path="/create-group" element={<GroupForm/>} />
        <Route path="/groups" element={<GroupList/>} />
        <Route path="/group/:groupId" element={<GroupDetails/>} />
        <Route path="/groups-management" element={<GroupManagement/>} />
        <Route path="/team" element={<AddTeamMember/>} />
        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
        <Route path="/twitterAuth" element={<TwitterAuth/>} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={<ConnectAccounts />} />
        </Route>

    </Routes>
    </BrowserRouter>
  );
};

export default App;

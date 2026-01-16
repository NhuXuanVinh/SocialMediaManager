import React from 'react';
import { BrowserRouter, Routes, Route} from 'react-router-dom';
import 'antd/dist/reset.css';
import '@ant-design/v5-patch-for-react-19'
import 'react-big-calendar/lib/css/react-big-calendar.css';

import SignUp from './components/SignUp';
import Login from './components/Login'; // Assuming you have the Login component
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './utils/ProtectedRoute';
import GroupForm from './components/GroupForm';
import GroupList from './components/GroupList';
import GroupDetails from './pages/GroupDetails';
import GroupManagement from './pages/GroupManagement';
import ConnectAccounts from './pages/ConnectAccounts';
import AddTeamMember from './pages/AddTeamMember';
import TagManagement from './pages/TagManagement';
import AnalysisPage from './pages/AnalysisPage';
import Analytics from './pages/Analytics';

const App = () => {
  return (
    <BrowserRouter>
    <Routes>
        {/* Normal Routes */}
        <Route path="/signup" element={<SignUp/>} />
        <Route path="/login" element={<Login/>} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
                <Route path="/create-group" element={<GroupForm/>} />

        <Route path="/groups" element={<GroupList/>} />
        <Route path="/group/:groupId" element={<GroupDetails/>} />
        <Route path="/groups-management" element={<GroupManagement/>} />
        <Route path="/team" element={<AddTeamMember/>} />
        <Route path="/tags" element={<TagManagement/>} />
        <Route path="/analytics" element={<Analytics />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/connect" element={<ConnectAccounts />} />
        </Route>

    </Routes>
    </BrowserRouter>
  );
};

export default App;

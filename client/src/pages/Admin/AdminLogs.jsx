import { useEffect, useState } from 'react';
import axios from 'axios';
import Pagination from '../../components/Pagination';

function AdminLogs() {
    const [logs, setLogs] = useState([]);
    const [filteredLogs, setFilteredLogs] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [actionTypes, setActionTypes] = useState([]);
    const [selectedAction, setSelectedAction] = useState('All');
    const [targetTypes, setTargetTypes] = useState([]);
    const [selectedTargetType, setSelectedTargetType] = useState('All');
    const logsPerPage = 10;


    useEffect(() => {
        const fetchLogs = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/admin/logs');
                setLogs(res.data);
                setFilteredLogs(res.data);

                const targets = Array.from(new Set(res.data.map(log => log.targetType)));
                setTargetTypes(['All', ...targets]);
            } catch (err) {
                console.error('Failed to fetch admin logs:', err);
            }
        };
        fetchLogs();
    }, []);


    useEffect(() => {
        let relatedLogs = logs;
        if (selectedTargetType !== 'All') {
            relatedLogs = logs.filter(log => log.targetType === selectedTargetType);
        }

        const actions = Array.from(new Set(relatedLogs.map(log => log.action)));
        setActionTypes(['All', ...actions]);


        if (!actions.includes(selectedAction)) {
            setSelectedAction('All');
        }
    }, [selectedTargetType, logs]);


    useEffect(() => {
        let result = logs;

        if (selectedTargetType !== 'All') {
            result = result.filter(log => log.targetType === selectedTargetType);
        }

        if (selectedAction !== 'All') {
            result = result.filter(log => log.action === selectedAction);
        }

        setFilteredLogs(result);
        setCurrentPage(1);
    }, [selectedAction, selectedTargetType, logs]);


    const indexOfLast = currentPage * logsPerPage;
    const indexOfFirst = indexOfLast - logsPerPage;
    const currentLogs = filteredLogs.slice(indexOfFirst, indexOfLast);
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

    return (
        <div style={{ padding: '2rem' }}>
            <h2>Admin Operation Logs</h2>

            {/* TargetType 筛选 */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>Filter by target type:</label>
                <select value={selectedTargetType} onChange={(e) => setSelectedTargetType(e.target.value)}>
                    {targetTypes.map((type, idx) => (
                        <option key={idx} value={type}>{type}</option>
                    ))}
                </select>
            </div>

            {/* Action 筛选 */}
            <div style={{ marginBottom: '1rem' }}>
                <label style={{ marginRight: '1rem' }}>Filter by action:</label>
                <select value={selectedAction} onChange={(e) => setSelectedAction(e.target.value)}>
                    {actionTypes.map((action, idx) => (
                        <option key={idx} value={action}>{action}</option>
                    ))}
                </select>
            </div>

            <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse', width: '100%' }}>
                <thead>
                <tr>
                    <th>Timestamp</th>
                    <th>Admin Email</th>
                    <th>Action</th>
                    <th>Target Type</th>
                    <th>Target ID</th>
                    <th>Details</th>
                </tr>
                </thead>
                <tbody>
                {currentLogs.map((log, index) => (
                    <tr key={index}>
                        <td>{new Date(log.timestamp).toLocaleString()}</td>
                        <td>{log.adminEmail}</td>
                        <td>{log.action}</td>
                        <td>{log.targetType}</td>
                        <td>{log.target}</td>
                        <td>{log.details}</td>
                    </tr>
                ))}
                </tbody>
            </table>

            <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
            />
        </div>
    );
}

export default AdminLogs;
import React, { useState, useEffect, useMemo } from 'react';
import { useTable, useSortBy } from 'react-table';
import { FaSortUp, FaSortDown } from 'react-icons/fa';
import ProjectCard from './ProjectCard';

// Use Webpack's require.context to load all JSON files from the /data folder
const dataContext = require.context('./data', false, /\.json$/);

const ProjectTable = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProjectId, setExpandedProjectId] = useState(null);
  const [selectedRound, setSelectedRound] = useState('Round 1');
  const [showAccepted, setShowAccepted] = useState(true);
  const [showRejected, setShowRejected] = useState(true);
  const [showPending, setShowPending] = useState(true);
  const [projects, setProjects] = useState([]);

  // Automatically detect available rounds based on files inside the data folder
  const rounds = useMemo(() => {
    return dataContext.keys().map((file) => ({
      name: file.replace('./', '').replace('.json', ''),  // Extract round name from file name
      data: dataContext(file) // Load the data
    }));
  }, []);

  // Update projects when selected round changes
  useEffect(() => {
    const selectedRoundData = rounds.find((round) => round.name === selectedRound);
    if (selectedRoundData) {
      setProjects(selectedRoundData.data);
    }
  }, [selectedRound, rounds]);

  const columns = useMemo(
    () => [
      {
        Header: 'Project Name',
        accessor: 'name',
        isSorted: true,
        isSortedDesc: false,
      },
      {
        Header: 'Website',
        accessor: 'website',
        Cell: ({ value }) => (
          value ? (
            <a
              href={value.includes('http') ? value : `https://${value}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:underline"
            >
              {value}
            </a>
          ) : (
            <span>No website available</span>
          )
        ),
      },
      {
        Header: 'Status',
        accessor: 'status',
      },
    ],
    []
  );

  const filteredData = useMemo(
    () =>
      projects.filter((project) => {
        const status = project.status.toLowerCase();
        const statusMatches =
          (showAccepted && status === 'approved') ||
          (showRejected && status === 'rejected') ||
          (showPending && status === 'pending');
        return statusMatches && project.name.toLowerCase().includes(searchTerm.toLowerCase());
      }),
    [projects, searchTerm, showAccepted, showRejected, showPending]
  );

  const acceptedCount = projects.filter((project) => project.status.toLowerCase() === 'approved').length;
  const rejectedCount = projects.filter((project) => project.status.toLowerCase() === 'rejected').length;
  const pendingCount = projects.filter((project) => project.status.toLowerCase() === 'pending').length;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    { columns, data: filteredData, initialState: { sortBy: [{ id: 'name', desc: false }] } },
    useSortBy
  );

  const toggleAnswers = (projectId) => {
    setExpandedProjectId(expandedProjectId === projectId ? null : projectId);
  };

  return (
    <div className="container mx-auto p-4 bg-gray-900 min-h-screen">


      <div className="text-center mb-6">
        <label htmlFor="roundSelect" className="text-gray-200 mr-4">Select Round:</label>
        <select
          id="roundSelect"
          className="p-2 bg-gray-800 text-gray-200 rounded border border-gray-700"
          value={selectedRound}
          onChange={(e) => setSelectedRound(e.target.value)}
        >
          {rounds.map((round) => (
            <option key={round.name} value={round.name}>
              {round.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-center items-center space-x-4 mb-6">
        <label className="text-gray-200">
          <input
            type="checkbox"
            className="mr-2"
            checked={showAccepted}
            onChange={() => setShowAccepted(!showAccepted)}
          />
          Show Accepted
        </label>
        <span className="text-gray-400">({acceptedCount})</span>

        <label className="text-gray-200">
          <input
            type="checkbox"
            className="mr-2"
            checked={showRejected}
            onChange={() => setShowRejected(!showRejected)}
          />
          Show Rejected
        </label>
        <span className="text-gray-400">({rejectedCount})</span>

        <label className="text-gray-200">
          <input
            type="checkbox"
            className="mr-2"
            checked={showPending}
            onChange={() => setShowPending(!showPending)}
          />
          Show Pending
        </label>
        <span className="text-gray-400">({pendingCount})</span>
      </div>

      <h1 className="text-3xl font-bold text-center text-blue-300 mb-6">
        {selectedRound} Project Answers
      </h1>

      <input
        type="text"
        placeholder="Search by project name..."
        className="mb-4 p-2 border border-gray-700 rounded w-full bg-gray-800 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-400"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <table {...getTableProps()} className="min-w-full bg-gray-800 shadow-lg rounded-lg">
        <thead className="bg-blue-700 text-white">
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()} key={headerGroup.id}>
              {headerGroup.headers.map((column) => (
                <th
                  {...column.getHeaderProps(column.getSortByToggleProps())}
                  className="p-3 text-left font-medium tracking-wider"
                  key={column.id}
                >
                  {column.render('Header')}
                  <span className="ml-2">
                    {column.isSorted ? (
                      column.isSortedDesc ? (
                        <FaSortDown className="inline-block" />
                      ) : (
                        <FaSortUp className="inline-block" />
                      )
                    ) : null}
                  </span>
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()} className="bg-gray-700">
          {rows.map((row) => {
            prepareRow(row);
            const status = row.original.status ? row.original.status.toLowerCase() : '';
            const rowColor =
              status === 'rejected' ? 'bg-red-900' :
              status === 'pending' ? 'bg-yellow-900' :
              status === 'approved' ? 'bg-green-900' : 'bg-gray-700';

            return (
              <React.Fragment key={row.id}>
                <tr
                  {...row.getRowProps()}
                  className={`cursor-pointer hover:bg-blue-600 ${rowColor}`}
                  onClick={() => toggleAnswers(row.original.id)}
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="p-3 border-b border-gray-600 text-gray-200"
                      key={cell.column.id}
                    >
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
                {expandedProjectId === row.original.id && (
                  <tr className="bg-gray-800" key={`expanded-${row.id}`}>
                    <td colSpan={columns.length}>
                      <ProjectCard key={row.original.id} project={row.original} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ProjectTable;

import React from 'react';

const ProjectCard = ({ project }) => {
  return (
    <div className="border border-gray-600 rounded-lg p-4 mb-4 bg-gray-800 shadow-md hover:shadow-lg">
      <h2 className="text-xl font-bold text-blue-300 mb-2">{project.name}</h2>
      <p className="text-blue-400 hover:underline">
        <a href={project.website} target="_blank" rel="noopener noreferrer">{project.website}</a>
      </p>
      <p className="text-gray-300 mt-1">Status: {project.status}</p>

      {/* Display the recipient with SEITrace link if it exists */}
      {project.recipient && (
        <p className="text-gray-300 mt-1">
          Recipient: 
          <a 
            href={`https://seitrace.com/address/${project.recipient}`} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="text-blue-400 hover:underline ml-1"
          >
            {project.recipient}
          </a>
        </p>
      )}

      <div className="mt-4">
        {project.answers.map((answer, index) => (
          <div key={index} className="mb-4">
            <h3 className="font-semibold text-gray-200">{answer.question}</h3>
            <p className="text-gray-400">{answer.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProjectCard;

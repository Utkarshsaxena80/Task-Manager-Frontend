import React, { useState } from 'react';
import { ethers } from 'ethers';
import { Toaster, toast } from 'react-hot-toast';
import { TaskForm } from './components/TaskForm';
import { TaskList } from './components/TaskList';
import { TASK_MANAGER_ABI, CONTRACT_ADDRESS } from './contracts/TaskManager';
import { ListTodo } from 'lucide-react';

function App() {
  const [tasks, setTasks] = useState([]);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    if (isConnecting) return;
    
    try {
      setIsConnecting(true);
      
      if (typeof window.ethereum === 'undefined') {
        toast.error('Please install MetaMask to use this app');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const account = accounts[0];
      setAccount(account);

      const signer = await provider.getSigner();
      const taskManager = new ethers.Contract(
        CONTRACT_ADDRESS,
        TASK_MANAGER_ABI,
        signer
      );
      
      setContract(taskManager);

      const tasks = await taskManager.getTask();
      setTasks(tasks);
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setAccount('');
          setTasks([]);
        } else {
          setAccount(accounts[0]);
        }
      });

      toast.success('Wallet connected successfully!');
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error(error.message || 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const addTask = async (title, description) => {
    try {
      if (!contract) return;
      
      const tx = await contract.addTask(title, description);
      const loadingToast = toast.loading('Adding task...');
      await tx.wait();
      
      const tasks = await contract.getTask();
      setTasks(tasks);
      toast.dismiss(loadingToast);
      toast.success('Task added successfully!');
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(error.message || 'Failed to add task');
    }
  };

  const completeTask = async (taskId,taskStatus) => {
    try {
      if (!contract) return;
      
      
      if(taskStatus===1){
        toast.error("already done");
        return ;
       }
       else{
         const tx = await contract.markTaskCompleted(taskId);
         const loadingToast = toast.loading('Completing task...');
         await tx.wait();
         
         const tasks = await contract.getTask();
         setTasks(tasks);
         toast.dismiss(loadingToast);
         toast.success('Task completed!');
       }
    } catch (error) {
      console.error('Error completing task:', error);
      toast.error(error.message || 'Failed to complete task');
    }
  };

  const deleteTask = async (taskId) => {
    try {
      if (!contract) return;
      
      const tx = await contract.deleteTask(taskId);
      const loadingToast = toast.loading('Deleting task...');
      await tx.wait();
      
      const tasks = await contract.getTask();
      setTasks(tasks);
      toast.dismiss(loadingToast);
      toast.success('Task deleted!');
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error(error.message || 'Failed to delete task');
    }
  };

  const editTask = async (taskId, title, description) => {
    try {
      if (!contract) return;
      
      const tx = await contract.editTask(taskId, title, description);
      const loadingToast = toast.loading('Updating task...');
      await tx.wait();
      
      const tasks = await contract.getTask();
      setTasks(tasks);
      toast.dismiss(loadingToast);
      toast.success('Task updated!');
    } catch (error) {
      console.error('Error editing task:', error);
      toast.error(error.message || 'Failed to update task');
    }
  };

  if (!account) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
          <ListTodo className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome to Blockchain Task Manager
          </h1>
          <p className="text-gray-600 mb-6">
            Connect your wallet to start managing your tasks on the blockchain.
          </p>
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Toaster />
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Task Manager</h1>
        <TaskForm onSubmit={addTask} />
        <TaskList
          tasks={tasks}
          onComplete={completeTask}
          onDelete={deleteTask}
          onEdit={editTask}
        />
      </div>
    </div>
  );
}

export default App;
import React, { useState } from 'react';
import { testMigration } from '../utils/testTweetCountsMigration';
import { migrateTweetCounts } from '../utils/runTweetCountsMigration';

const MigrationTweetCountControls = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const handleRunMigration = async () => {
    if (isRunning) return;

    if (!confirm('⚠️ Are you sure you want to run the migration? This will add/update count fields on all tweets.')) {
      return;
    }

    setIsRunning(true);
    try {
      console.log('🚀 Starting migration...');
      const result = await migrateTweetCounts();
      console.log('✅ Migration completed successfully!', result);
      alert(`✅ Migration completed! ${result.totalUpdated} tweets updated, ${result.totalSkipped} skipped.`);
    } catch (error) {
      console.error('❌ Migration failed:', error);
      alert('❌ Migration failed. Check console for details.');
    } finally {
      setIsRunning(false);
    }
  };

  const handleTestMigration = async () => {
    if (isTesting) return;

    setIsTesting(true);
    try {
      console.log('🔍 Running migration test...');
      await testMigration();
      console.log('✅ Test completed. Check console output above.');
      alert('✅ Test completed! Check console for detailed results.');
    } catch (error) {
      console.error('❌ Test failed:', error);
      alert('❌ Test failed. Check console for details.');
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-bold text-yellow-800 mb-2">
        🛠️ Migration Controls (Dev Only)
      </h3>
      <div className="flex gap-2">
        <button
          onClick={handleTestMigration}
          disabled={isTesting || isRunning}
          className={`px-3 py-2 text-sm font-medium rounded ${
            isTesting
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isTesting ? '🔍 Testing...' : '🔍 Test Migration'}
        </button>

        <button
          onClick={handleRunMigration}
          disabled={isRunning || isTesting}
          className={`px-3 py-2 text-sm font-medium rounded ${
            isRunning
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-red-500 hover:bg-red-600 text-white'
          }`}
        >
          {isRunning ? '🚀 Running...' : '🚀 Run Migration'}
        </button>
      </div>
      <p className="text-xs text-yellow-700 mt-2">
        Test checks all count fields. Migration adds missing count fields to tweets.
      </p>
    </div>
  );
};

export default MigrationTweetCountControls;
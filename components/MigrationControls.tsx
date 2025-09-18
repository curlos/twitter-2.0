import React, { useState } from 'react';
import { testMigration } from '../utils/testTweetCountsMigration';
import { migrateTweetCounts } from '../utils/runTweetCountsMigration';
import { testUserMigration } from '../utils/testUserCountsMigration';
import { migrateUserCounts } from '../utils/runUserCountsMigration';

interface MigrationControlsProps {
  type: 'tweetCounts' | 'userCounts';
}

const MigrationControls = ({ type }: MigrationControlsProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isTesting, setIsTesting] = useState(false);

  const getMigrationConfig = () => {
    if (type === 'tweetCounts') {
      return {
        runFn: migrateTweetCounts,
        testFn: testMigration,
        entityName: 'tweets',
        fields: 'count fields'
      };
    } else {
      return {
        runFn: migrateUserCounts,
        testFn: testUserMigration,
        entityName: 'users',
        fields: 'follower/following count fields'
      };
    }
  };

  const config = getMigrationConfig();

  const handleRunMigration = async () => {
    if (isRunning) return;

    if (!confirm(`⚠️ Are you sure you want to run the migration? This will add/update ${config.fields} on all ${config.entityName}.`)) {
      return;
    }

    setIsRunning(true);
    try {
      console.log('🚀 Starting migration...');
      const result = await config.runFn();
      console.log('✅ Migration completed successfully!', result);
      alert(`✅ Migration completed! ${result.totalUpdated} ${config.entityName} updated, ${result.totalSkipped} skipped.`);
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
      await config.testFn();
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
        Test checks all {config.fields}. Migration adds missing {config.fields} to {config.entityName}.
      </p>
    </div>
  );
};

export default MigrationControls;
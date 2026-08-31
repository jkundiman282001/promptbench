<?php

namespace App\Services\Llm;

use App\Services\Llm\DTOs\LlmCompletionRequest;
use App\Services\Llm\DTOs\LlmCompletionResponse;
use App\Services\Llm\Drivers\OpenAiDriver;
use App\Services\Llm\Drivers\AnthropicDriver;
use App\Services\Llm\Drivers\GeminiDriver;
use App\Services\Llm\Drivers\GroqDriver;
use InvalidArgumentException;

class LlmManager
{
    /** @var array<string, LlmDriverInterface> */
    protected array $drivers = [];

    public function __construct()
    {
        $this->registerDriver('openai', new OpenAiDriver());
        $this->registerDriver('anthropic', new AnthropicDriver());
        $this->registerDriver('gemini', new GeminiDriver());
        $this->registerDriver('groq', new GroqDriver());
    }

    public function registerDriver(string $name, LlmDriverInterface $driver): void
    {
        $this->drivers[$name] = $driver;
    }

    public function driver(string $name): LlmDriverInterface
    {
        if (!isset($this->drivers[$name])) {
            throw new InvalidArgumentException("Driver [{$name}] is not registered in LlmManager.");
        }
        return $this->drivers[$name];
    }

    /**
     * Resolve the appropriate driver for a model identifier.
     */
    public function resolveDriverForModel(string $model): LlmDriverInterface
    {
        foreach ($this->drivers as $driver) {
            if ($driver->supportsModel($model)) {
                return $driver;
            }
        }
        // Default to OpenAI compatible
        return $this->drivers['openai'];
    }

    /**
     * Complete a prompt request across resolved or specified driver.
     */
    public function complete(LlmCompletionRequest $request): LlmCompletionResponse
    {
        $driver = $this->resolveDriverForModel($request->model);
        return $driver->complete($request);
    }
}

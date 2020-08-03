/**
 * Mix base layers
 * @param {LayerBase} mother The mother layer
 * @param {LayerBase} father The father layer
 * @constructor
 */
const MixerLayerBase = function(mother, father) {
    this.mother = mother;
    this.father = father;
};

MixerLayerBase.prototype = Object.create(Mixer.prototype);
MixerLayerBase.prototype.SAMPLER_BLEND_PALETTE = new SamplerSigmoid(0, 1, 20);

/**
 * Create a new layer that mixes the properties from both parents
 * @param {Random} random A randomizer
 * @returns {LayerBase} The mixed layer
 */
MixerLayerBase.prototype.mix = function(random) {
    return new LayerBase(
        this.mother.paletteSample.interpolate(
            this.father.paletteSample,
            this.SAMPLER_BLEND_PALETTE.sample(random.getFloat())));
};

/**
 * Mutate the properties of a layer in place
 * @param {LayerBase} layer The layer
 * @param {Random} random A randomizer
 * @returns {LayerBase} The mutated layer
 */
MixerLayerBase.mutate = function(layer, random) {
    return layer; // TODO: Mutate here
};